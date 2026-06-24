import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'
import { useProducts, useGenerateSuggestions, useCreateSuggestedLook } from '@/hooks'
import { useSnackbarStore } from '@/stores'
import { PRODUCT_CATEGORY_LABELS, LOOK_SLOTS } from '@/config/constants'
import { getErrorMessage } from '@/utils/error'
import { cn } from '@/utils/cn'
import type { Customer, SuggestedProduct, AiSuggestionResult, LookSlot, Product } from '@/types'

interface AiSuggestionsProps {
  customer: Customer
}

const priceFmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const SLOT_LABELS: Record<LookSlot, string> = {
  left_top: 'Haut',
  left_bottom: 'Bas',
  right_top: 'Accessoire',
  right_middle: 'Accessoire',
  right_bottom: 'Chaussures',
}

function effectivePrice(p: Product): number {
  return p.final_price != null && p.final_price < p.price ? p.final_price : p.price
}

/** Compact product tile with its match score and justifications. */
function SuggestionCard({ item }: { item: SuggestedProduct }) {
  const { product, score, reasons } = item
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-card">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <PhotoIcon className="h-10 w-10" />
          </div>
        )}
        <span
          className={cn(
            'absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-sm',
            score >= 70 ? 'bg-emerald-600' : score >= 45 ? 'bg-amber-500' : 'bg-gray-400'
          )}
        >
          {score}%
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {PRODUCT_CATEGORY_LABELS[product.category]}
          {product.type ? ` · ${product.type}` : ''}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900">{product.title}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">
          {priceFmt.format(effectivePrice(product))}
        </p>
        {reasons.length > 0 && (
          <ul className="mt-2 space-y-1">
            {reasons.slice(0, 3).map((reason, i) => (
              <li key={i} className="flex items-start gap-1 text-xs text-gray-600">
                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-brand-500" />
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function AiSuggestions({ customer }: AiSuggestionsProps) {
  const navigate = useNavigate()
  const { success, error: showError } = useSnackbarStore()

  // Pull a generous slice of the catalogue to rank against.
  const { data: productsResult, isLoading: loadingProducts } = useProducts(undefined, {
    pageSize: 100,
  })
  const products = productsResult?.data ?? []

  const generate = useGenerateSuggestions()
  const createLook = useCreateSuggestedLook()
  const [result, setResult] = useState<AiSuggestionResult | null>(null)

  const handleGenerate = async () => {
    try {
      const res = await generate.mutateAsync({ customer, products })
      setResult(res)
      if (res.products.length === 0) {
        showError('Aucune suggestion : le catalogue ne correspond pas aux préférences.')
      }
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la génération des suggestions'))
    }
  }

  const handleCreateLook = async () => {
    if (!result?.look) return
    const { slots } = result.look
    const fields = {
      name: `Suggestion IA — ${customer.first_name || customer.email}`,
      universe: 'Suggestion IA',
      left_top: slots.left_top?.id ?? null,
      left_bottom: slots.left_bottom?.id ?? null,
      right_top: slots.right_top?.id ?? null,
      right_middle: slots.right_middle?.id ?? null,
      right_bottom: slots.right_bottom?.id ?? null,
    }
    try {
      const look = await createLook.mutateAsync({ email: customer.email, fields })
      success('Look créé pour le client')
      navigate(`/looks/edit?id=${look.id}`)
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la création du look'))
    }
  }

  const lookSlots = result?.look?.slots ?? {}
  const lookHasProducts = Object.values(lookSlots).some(Boolean)

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold text-gray-900">Suggestions IA</h2>
          {result && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                result.source === 'ai'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-600'
              )}
              title={
                result.source === 'ai'
                  ? 'Généré par Claude'
                  : 'Moteur local (Supabase/IA non configurée ou indisponible)'
              }
            >
              {result.source === 'ai' ? 'Claude' : 'Moteur local'}
            </span>
          )}
        </div>
        <Button
          onClick={handleGenerate}
          loading={generate.isPending}
          disabled={loadingProducts || products.length === 0}
        >
          <SparklesIcon className="mr-2 h-4 w-4" />
          {result ? 'Régénérer' : 'Générer des suggestions'}
        </Button>
      </div>

      {!result && !generate.isPending && (
        <p className="mt-4 text-sm text-gray-500">
          Générez des recommandations de vêtements personnalisées à partir du
          questionnaire du client (styles, couleurs, tailles, budget).
          {products.length === 0 && !loadingProducts && ' Aucun produit dans le catalogue.'}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-6">
          <p className="text-sm text-gray-700">{result.summary}</p>

          {/* Suggested products */}
          {result.products.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-500">Produits recommandés</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {result.products.map((item) => (
                  <SuggestionCard key={item.product.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Composed look */}
          {lookHasProducts && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-700">Look complet proposé</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateLook}
                  loading={createLook.isPending}
                >
                  Créer ce look pour le client
                </Button>
              </div>
              {result.look?.rationale && (
                <p className="mt-2 text-xs text-gray-500">{result.look.rationale}</p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {LOOK_SLOTS_ORDER.map((slot) => {
                  const product = lookSlots[slot]
                  return (
                    <div key={slot} className="flex flex-col">
                      <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {SLOT_LABELS[slot]}
                      </span>
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-surface">
                        {product?.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            {product ? (
                              <PhotoIcon className="h-6 w-6" />
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </div>
                        )}
                      </div>
                      {product && (
                        <span className="mt-1 truncate text-[11px] text-gray-600">
                          {product.title}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Stable slot order for rendering the look grid.
const LOOK_SLOTS_ORDER: LookSlot[] = [
  LOOK_SLOTS.LEFT_TOP,
  LOOK_SLOTS.LEFT_BOTTOM,
  LOOK_SLOTS.RIGHT_TOP,
  LOOK_SLOTS.RIGHT_MIDDLE,
  LOOK_SLOTS.RIGHT_BOTTOM,
]
