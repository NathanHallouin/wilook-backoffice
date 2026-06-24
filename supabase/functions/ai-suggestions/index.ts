// Supabase Edge Function: AI clothing suggestions powered by Claude.
//
// Receives a customer questionnaire + a shortlist of catalogue products and
// returns ranked product ids (with scores and reasons) plus a composed look.
// The client (`src/services/suggestions.ts`) maps the returned ids back to real
// products and falls back to its local scoring engine if this function errors.
//
// Deploy:  supabase functions deploy ai-suggestions
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// deno-lint-ignore-file no-explicit-any
import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Structured-output schema — guarantees parseable, id-based JSON.
const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          score: { type: 'integer' },
          reason: { type: 'string' },
        },
        required: ['id', 'score', 'reason'],
      },
    },
    look: {
      type: 'object',
      additionalProperties: false,
      properties: {
        rationale: { type: 'string' },
        slots: {
          type: 'object',
          additionalProperties: false,
          properties: {
            left_top: { type: ['string', 'null'] },
            left_bottom: { type: ['string', 'null'] },
            right_top: { type: ['string', 'null'] },
            right_middle: { type: ['string', 'null'] },
            right_bottom: { type: ['string', 'null'] },
          },
          required: [
            'left_top',
            'left_bottom',
            'right_top',
            'right_middle',
            'right_bottom',
          ],
        },
      },
      required: ['rationale', 'slots'],
    },
  },
  required: ['summary', 'products', 'look'],
}

const SYSTEM_PROMPT = `Tu es un styliste personnel pour une marque de mode (WILOOK).
À partir du questionnaire d'un client et d'une liste de produits du catalogue, tu recommandes les pièces les plus pertinentes et tu composes une tenue complète.

Règles :
- N'utilise QUE les produits fournis (référence-les par leur "id" exact). N'invente jamais d'id.
- Tiens compte des styles, couleurs préférées, tailles et budget du client, et exclus tout ce qui figure dans "avoid".
- "products" : classe du plus pertinent au moins pertinent (8 à 12 maximum), avec un "score" 0–100 et une "reason" courte en français.
- "look.slots" : compose une tenue cohérente. left_top = haut, left_bottom = bas, right_top et right_middle = accessoires, right_bottom = chaussures. Mets null si aucun produit adapté. Ne réutilise pas le même produit dans deux emplacements.
- "summary" et "look.rationale" : une à deux phrases en français.`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
  }

  let payload: { customer?: unknown; products?: unknown[] }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const products = Array.isArray(payload.products) ? payload.products : []
  if (products.length === 0) {
    return json({ error: 'No products provided' }, 400)
  }

  const client = new Anthropic({ apiKey })

  const userContent = `Questionnaire du client :
${JSON.stringify(payload.customer ?? {}, null, 2)}

Produits du catalogue (id + caractéristiques) :
${JSON.stringify(products, null, 2)}

Recommande les meilleures pièces et compose une tenue.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
      },
      messages: [{ role: 'user', content: userContent }],
    } as any)

    // Structured outputs guarantee a single JSON text block.
    const textBlock = (message.content as any[]).find((b) => b.type === 'text')
    if (!textBlock?.text) {
      return json({ error: 'Empty model response' }, 502)
    }

    const parsed = JSON.parse(textBlock.text)
    return json(parsed)
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Claude request failed' },
      502
    )
  }
})
