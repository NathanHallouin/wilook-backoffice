import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Customer,
  Product,
  ProductCategory,
  LookSlot,
  SuggestedProduct,
  LookSuggestion,
  AiSuggestionResult,
} from '@/types'

/**
 * Clothing suggestion engine.
 *
 * Two layers, mirroring the project's graceful-degradation pattern:
 *  - A **local scoring engine** (pure, deterministic, always available) that
 *    ranks catalogue products against a customer's questionnaire and composes a
 *    full look. It runs in demo mode and as the guaranteed fallback.
 *  - An optional **Claude-powered edge function** (`ai-suggestions`) used when
 *    Supabase is configured. It re-ranks a shortlist and writes richer,
 *    natural-language justifications. Any failure falls back to the local result.
 *
 * The edge function only ever returns product *ids* — the client maps them back
 * to real `Product` objects, so the model can never inject bogus catalogue data.
 */

/** How many top local candidates we hand to the LLM to re-rank (bounds token cost). */
const SHORTLIST_SIZE = 40
/** How many suggestions the local engine surfaces in its own result. */
const LOCAL_RESULT_SIZE = 12

/** Which product categories may fill each look slot, in priority order. */
const SLOT_CATEGORIES: Record<LookSlot, ProductCategory[]> = {
  left_top: ['top', 'set'],
  left_bottom: ['bottom'],
  right_top: ['accessories', 'top'],
  right_middle: ['accessories', 'set'],
  right_bottom: ['shoes'],
}

const LOOK_SLOTS: LookSlot[] = [
  'left_top',
  'left_bottom',
  'right_top',
  'right_middle',
  'right_bottom',
]

/** Coerce a value into a lowercased string array — tolerates a single string or junk. */
function toLowerArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string').map((v) => v.toLowerCase())
  }
  if (typeof value === 'string' && value.trim()) return [value.toLowerCase()]
  return []
}

/** Every free-text token a customer expressed: styles, preferred colours, plus questionnaire extras. */
interface CustomerProfile {
  styles: string[]
  colors: string[]
  avoid: string[]
  budget: number | null
  sizes: { top?: string; bottom?: string; shoes?: string }
}

export function buildProfile(customer: Customer): CustomerProfile {
  const prefs = customer.style_preferences
  // Pull any extra string arrays the questionnaire may have stored (best-effort).
  const extra = customer.questionnaire_data ?? {}
  const extraColors = toLowerArray(extra.colors)
  const extraStyles = toLowerArray(extra.styles)
  const extraAvoid = toLowerArray(extra.avoid)

  return {
    styles: [...new Set([...toLowerArray(prefs?.styles), ...extraStyles])],
    colors: [...new Set([...toLowerArray(prefs?.colors), ...extraColors])],
    avoid: [...new Set([...toLowerArray(prefs?.avoid), ...extraAvoid])],
    budget: customer.budget,
    sizes: customer.sizes ?? {},
  }
}

/** All searchable text on a product, lowercased, for keyword matching. */
function productText(p: Product): string {
  return [p.title, p.type, p.brand, ...p.colors, ...p.materials, ...p.details]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function effectivePrice(p: Product): number {
  return p.final_price != null && p.final_price < p.price ? p.final_price : p.price
}

/** The size relevant to a product's category, if the customer provided one. */
function customerSizeFor(category: ProductCategory, sizes: CustomerProfile['sizes']): string | undefined {
  if (category === 'shoes') return sizes.shoes
  if (category === 'bottom') return sizes.bottom
  // top / set / accessories all key off the "top" measurement.
  return sizes.top
}

/**
 * Score a single product against a profile.
 * Returns `null` when the product hits an "avoid" term — it is excluded outright.
 */
export function scoreProduct(product: Product, profile: CustomerProfile): SuggestedProduct | null {
  const text = productText(product)
  const colorsLower = product.colors.map((c) => c.toLowerCase())

  // Hard exclusion: anything the customer explicitly wants to avoid.
  if (profile.avoid.some((term) => text.includes(term))) return null

  let score = 30 // baseline so every kept product is a candidate
  const reasons: string[] = []

  // Preferred colours — the strongest signal we can map reliably.
  const matchedColors = product.colors.filter((c) => profile.colors.includes(c.toLowerCase()))
  if (matchedColors.length > 0) {
    score += 30
    reasons.push(`Couleur préférée : ${matchedColors.join(', ')}`)
  } else if (profile.colors.length > 0 && colorsLower.length > 0) {
    score -= 5 // mild penalty: has colours, none preferred
  }

  // Style keywords matched anywhere in the product's text.
  const matchedStyles = profile.styles.filter((s) => text.includes(s))
  if (matchedStyles.length > 0) {
    score += Math.min(20, matchedStyles.length * 10)
    reasons.push(`Style : ${matchedStyles.join(', ')}`)
  }

  // Size availability for the customer.
  const wantedSize = customerSizeFor(product.category, profile.sizes)
  if (wantedSize) {
    const pool = product.category === 'shoes' ? product.shoe_sizes : product.sizes
    if (pool.length === 0) {
      // Unknown sizing — neutral.
    } else if (pool.includes(wantedSize)) {
      score += 25
      reasons.push(`Taille disponible : ${wantedSize}`)
    } else {
      score -= 20
      reasons.push('Taille non disponible')
    }
  }

  // Budget — treated as a soft per-item ceiling.
  if (profile.budget != null) {
    const price = effectivePrice(product)
    if (price <= profile.budget) {
      score += 15
      reasons.push('Dans le budget')
      if (price <= profile.budget * 0.5) score += 5
    } else {
      score -= 15
      reasons.push('Au-dessus du budget')
    }
  }

  // A live promotion is a nice-to-have.
  if (product.final_price != null && product.final_price < product.price) {
    score += 5
    reasons.push('En promotion')
  }

  return {
    product,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
  }
}

/** Rank the whole catalogue for a customer, best first, excluding avoided items. */
export function scoreProducts(customer: Customer, products: Product[]): SuggestedProduct[] {
  const profile = buildProfile(customer)
  return products
    .map((p) => scoreProduct(p, profile))
    .filter((s): s is SuggestedProduct => s !== null)
    .sort((a, b) => b.score - a.score)
}

/** Greedily fill the 5 look slots from a ranked list, never reusing a product. */
export function composeLook(scored: SuggestedProduct[]): LookSuggestion {
  const slots: Partial<Record<LookSlot, Product>> = {}
  const used = new Set<string>()

  for (const slot of LOOK_SLOTS) {
    const categories = SLOT_CATEGORIES[slot]
    const pick = scored.find(
      (s) => categories.includes(s.product.category) && !used.has(s.product.id)
    )
    if (pick) {
      slots[slot] = pick.product
      used.add(pick.product.id)
    }
  }

  const pieces = Object.values(slots).length
  const rationale =
    pieces > 0
      ? `Look composé de ${pieces} pièce${pieces > 1 ? 's' : ''} accordée${pieces > 1 ? 's' : ''} aux préférences du client.`
      : 'Pas assez de produits compatibles pour composer un look complet.'

  return { slots, rationale }
}

function localSummary(customer: Customer, count: number): string {
  const name = customer.first_name || customer.email
  if (count === 0) {
    return `Aucun produit du catalogue ne correspond aux préférences de ${name}.`
  }
  return `${count} produit${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} pour ${name} d'après son questionnaire (styles, couleurs, tailles et budget).`
}

/** Build the always-available local result (also the fallback for the AI path). */
function localResult(customer: Customer, scored: SuggestedProduct[]): AiSuggestionResult {
  const products = scored.slice(0, LOCAL_RESULT_SIZE)
  return {
    source: 'local',
    summary: localSummary(customer, products.length),
    products,
    look: composeLook(scored),
  }
}

// ---- AI (Claude edge function) path -----------------------------------------

interface AiResponse {
  summary?: string
  products?: { id: string; score?: number; reason?: string }[]
  look?: { rationale?: string; slots?: Partial<Record<LookSlot, string | null>> }
}

/** A compact, token-light product view sent to the edge function. */
function compactProduct(p: Product) {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    type: p.type,
    brand: p.brand,
    colors: p.colors,
    materials: p.materials,
    details: p.details,
    price: p.price,
    final_price: p.final_price,
    sizes: p.sizes,
    shoe_sizes: p.shoe_sizes,
  }
}

/** Rebuild a typed result from the LLM's id-based response, falling back per-field. */
function mergeAiResult(
  ai: AiResponse,
  byId: Map<string, Product>,
  scoredById: Map<string, SuggestedProduct>,
  fallback: AiSuggestionResult
): AiSuggestionResult {
  const products: SuggestedProduct[] = (ai.products ?? [])
    .map((item) => {
      const product = byId.get(item.id)
      if (!product) return null
      const localScore = scoredById.get(item.id)?.score ?? 50
      return {
        product,
        score: typeof item.score === 'number' ? Math.max(0, Math.min(100, item.score)) : localScore,
        reasons: item.reason ? [item.reason] : (scoredById.get(item.id)?.reasons ?? []),
      }
    })
    .filter((s): s is SuggestedProduct => s !== null)

  // If the model returned nothing usable, keep the local result entirely.
  if (products.length === 0) return fallback

  const slots: Partial<Record<LookSlot, Product>> = {}
  const aiSlots = ai.look?.slots ?? {}
  for (const slot of LOOK_SLOTS) {
    const id = aiSlots[slot]
    if (id && byId.has(id)) slots[slot] = byId.get(id)!
  }
  const look: LookSuggestion =
    Object.values(slots).length > 0
      ? { slots, rationale: ai.look?.rationale || fallback.look?.rationale || '' }
      : (fallback.look ?? { slots: {}, rationale: '' })

  return {
    source: 'ai',
    summary: ai.summary || fallback.summary,
    products,
    look,
  }
}

/**
 * Get clothing suggestions for a customer.
 *
 * Always returns a result: the Claude edge function when available, otherwise
 * (or on any error) the local scoring engine.
 */
export async function getSuggestions(
  customer: Customer,
  products: Product[]
): Promise<AiSuggestionResult> {
  const scored = scoreProducts(customer, products)
  const fallback = localResult(customer, scored)

  if (!isSupabaseConfigured || !supabase) return fallback

  try {
    const shortlist = scored.slice(0, SHORTLIST_SIZE).map((s) => s.product)
    if (shortlist.length === 0) return fallback

    const { data, error } = await supabase.functions.invoke<AiResponse>('ai-suggestions', {
      body: {
        customer: {
          first_name: customer.first_name,
          budget: customer.budget,
          style_preferences: customer.style_preferences,
          sizes: customer.sizes,
          questionnaire_data: customer.questionnaire_data,
        },
        products: shortlist.map(compactProduct),
      },
    })

    if (error || !data) return fallback

    const byId = new Map(products.map((p) => [p.id, p]))
    const scoredById = new Map(scored.map((s) => [s.product.id, s]))
    return mergeAiResult(data, byId, scoredById, fallback)
  } catch {
    // Network / function error — the local engine still has the customer covered.
    return fallback
  }
}
