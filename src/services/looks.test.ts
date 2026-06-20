import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
  isDev: true,
}))

import { fetchLooks, createLook, deleteLooks } from './looks'

beforeEach(() => {
  localStorage.clear()
})

describe('fetchLooks (mock mode) — filters', () => {
  it('returns all looks by default', async () => {
    const { data, count } = await fetchLooks('all')
    expect(count).toBe(1)
    expect(data[0].name).toBe('Casual Friday')
  })

  it('keeps only public looks', async () => {
    const { count } = await fetchLooks('public')
    expect(count).toBe(1) // seeded look is public
  })

  it('keeps only unused looks (no customers)', async () => {
    const { count } = await fetchLooks('unused')
    expect(count).toBe(0) // seeded look has customers_count 2
  })
})

// NOTE: relative counts — the mockDb mutates module-level state across calls.
describe('createLook / deleteLooks (mock mode)', () => {
  it('adds a new look', async () => {
    const before = (await fetchLooks('all')).count
    await createLook({ name: 'Test Look', is_public: false })
    expect((await fetchLooks('all')).count).toBe(before + 1)
  })

  it('bulk-deletes looks by id', async () => {
    const created = await createLook({ name: 'Disposable' })
    const before = await fetchLooks('all')
    await deleteLooks([created.id])
    const after = await fetchLooks('all')
    expect(after.count).toBe(before.count - 1)
  })
})
