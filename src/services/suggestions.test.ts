import { describe, it, expect } from 'vitest'
import { buildProfile, scoreProduct, scoreProducts, composeLook } from './suggestions'
import type { Customer, Product } from '@/types'

const baseCustomer: Customer = {
  email: 'c@example.com',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  first_name: 'Alice',
  last_name: 'B',
  budget: 100,
  style_preferences: { styles: ['Casual'], colors: ['Noir'], avoid: ['Cuir'] },
  sizes: { top: 'M', bottom: '40', shoes: '42' },
  questionnaire_data: null,
}

function makeProduct(over: Partial<Product>): Product {
  return {
    id: 'p',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    title: 'Produit',
    description: null,
    category: 'top',
    type: 'Top',
    condition: 'new',
    brand: null,
    provider: null,
    colors: [],
    materials: [],
    details: [],
    sizes: [],
    shoe_sizes: [],
    price: 50,
    final_price: null,
    images: [],
    thumbnail: null,
    ...over,
  }
}

describe('buildProfile', () => {
  it('lowercases and merges preferences with questionnaire extras', () => {
    const profile = buildProfile({
      ...baseCustomer,
      questionnaire_data: { colors: ['Bleu'], styles: ['Sport'] },
    })
    expect(profile.colors).toEqual(expect.arrayContaining(['noir', 'bleu']))
    expect(profile.styles).toEqual(expect.arrayContaining(['casual', 'sport']))
    expect(profile.avoid).toContain('cuir')
  })

  it('tolerates malformed (non-array) preference values', () => {
    const profile = buildProfile({
      ...baseCustomer,
      style_preferences: {
        styles: 'Casual' as unknown as string[],
        colors: 'Noir' as unknown as string[],
      },
    })
    expect(profile.styles).toContain('casual')
    expect(profile.colors).toContain('noir')
  })
})

describe('scoreProduct', () => {
  const profile = buildProfile(baseCustomer)

  it('excludes products matching an avoid term', () => {
    const leather = makeProduct({ materials: ['Cuir'] })
    expect(scoreProduct(leather, profile)).toBeNull()
  })

  it('rewards a preferred colour', () => {
    const black = makeProduct({ colors: ['Noir'] })
    const other = makeProduct({ colors: ['Rouge'] })
    const blackScore = scoreProduct(black, profile)!.score
    const otherScore = scoreProduct(other, profile)!.score
    expect(blackScore).toBeGreaterThan(otherScore)
    expect(scoreProduct(black, profile)!.reasons.join(' ')).toContain('Noir')
  })

  it('rewards an available size and penalizes a missing one', () => {
    const fits = makeProduct({ category: 'top', sizes: ['M', 'L'] })
    const tooBig = makeProduct({ category: 'top', sizes: ['XS'] })
    expect(scoreProduct(fits, profile)!.score).toBeGreaterThan(
      scoreProduct(tooBig, profile)!.score
    )
  })

  it('rewards items within budget over expensive ones', () => {
    const cheap = makeProduct({ price: 40 })
    const pricey = makeProduct({ price: 300 })
    expect(scoreProduct(cheap, profile)!.score).toBeGreaterThan(
      scoreProduct(pricey, profile)!.score
    )
  })

  it('clamps the score to the 0–100 range', () => {
    const great = makeProduct({
      category: 'top',
      colors: ['Noir'],
      sizes: ['M'],
      price: 20,
      final_price: 15,
      title: 'Top Casual',
    })
    const s = scoreProduct(great, profile)!.score
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
  })
})

describe('scoreProducts', () => {
  it('returns kept products sorted by descending score', () => {
    const products = [
      makeProduct({ id: 'a', colors: ['Rouge'] }),
      makeProduct({ id: 'b', colors: ['Noir'], sizes: ['M'] }),
      makeProduct({ id: 'c', materials: ['Cuir'] }), // excluded
    ]
    const scored = scoreProducts(baseCustomer, products)
    expect(scored.map((s) => s.product.id)).toEqual(['b', 'a'])
  })
})

describe('composeLook', () => {
  it('fills slots by category without reusing a product', () => {
    const products = [
      makeProduct({ id: 'top', category: 'top', colors: ['Noir'], sizes: ['M'] }),
      makeProduct({ id: 'bottom', category: 'bottom', sizes: ['40'] }),
      makeProduct({ id: 'shoes', category: 'shoes', shoe_sizes: ['42'] }),
      makeProduct({ id: 'acc', category: 'accessories' }),
    ]
    const scored = scoreProducts(baseCustomer, products)
    const look = composeLook(scored)
    expect(look.slots.left_top?.id).toBe('top')
    expect(look.slots.left_bottom?.id).toBe('bottom')
    expect(look.slots.right_bottom?.id).toBe('shoes')
    expect(look.slots.right_top?.id).toBe('acc')

    const usedIds = Object.values(look.slots).map((p) => p!.id)
    expect(new Set(usedIds).size).toBe(usedIds.length)
  })

  it('reports when no products are available', () => {
    const look = composeLook([])
    expect(Object.keys(look.slots)).toHaveLength(0)
    expect(look.rationale).toMatch(/Pas assez/)
  })
})
