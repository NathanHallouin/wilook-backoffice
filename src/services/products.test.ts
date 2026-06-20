import { describe, it, expect, beforeEach, vi } from 'vitest'

// Force the services into demo (mock) mode so they hit the localStorage-backed
// mockDb instead of a real Supabase client.
vi.mock('./supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
  isDev: true,
}))

import { fetchProducts, deleteProducts } from './products'

beforeEach(() => {
  // Each test re-seeds from the default mock dataset.
  localStorage.clear()
})

describe('fetchProducts (mock mode) — filtering', () => {
  it('returns every seeded product without filters', async () => {
    const { data, count } = await fetchProducts()
    expect(count).toBe(3)
    expect(data).toHaveLength(3)
  })

  it('filters by category', async () => {
    const { data } = await fetchProducts({ category: 'shoes' })
    expect(data.map((p) => p.title)).toEqual(['Sneakers Blanches'])
  })

  it('keeps only on-sale products', async () => {
    const { data } = await fetchProducts({ onSale: true })
    expect(data).toHaveLength(1)
    expect(data[0].title).toBe('Jean Slim Bleu')
  })

  it('filters by clothing size', async () => {
    const { data } = await fetchProducts({ sizes: ['40'] })
    expect(data.map((p) => p.title)).toEqual(['Jean Slim Bleu'])
  })

  it('filters by shoe size', async () => {
    const { data } = await fetchProducts({ shoeSizes: ['42'] })
    expect(data.map((p) => p.title)).toEqual(['Sneakers Blanches'])
  })
})

describe('deleteProducts (mock mode) — bulk delete', () => {
  it('removes several products in one call', async () => {
    const { data, count } = await fetchProducts()
    expect(count).toBe(3)
    const ids = data.slice(0, 2).map((p) => p.id)
    await deleteProducts(ids)
    const after = await fetchProducts()
    expect(after.count).toBe(1)
  })

  it('is a no-op for an empty id list', async () => {
    await deleteProducts([])
    const { count } = await fetchProducts()
    expect(count).toBe(3)
  })
})
