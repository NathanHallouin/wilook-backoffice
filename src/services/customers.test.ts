import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
  isDev: true,
}))

import {
  fetchCustomers,
  fetchCustomerByEmail,
  createCustomer,
  deleteCustomer,
  searchCustomers,
} from './customers'

beforeEach(() => {
  localStorage.clear()
})

describe('fetchCustomers (mock mode) — search & sort', () => {
  it('returns all customers by default', async () => {
    const { count } = await fetchCustomers()
    expect(count).toBe(2)
  })

  it('searches by name (last name match)', async () => {
    const { data } = await fetchCustomers({ search: 'doe' })
    expect(data.map((c) => c.email)).toEqual(['john@example.com'])
  })

  it('sorts by email ascending', async () => {
    const { data } = await fetchCustomers({ sortColumn: 'email', sortDir: 'asc' })
    expect(data.map((c) => c.email)).toEqual(['jane@example.com', 'john@example.com'])
  })

  it('sorts by number of looks descending', async () => {
    const { data } = await fetchCustomers({ sortColumn: 'nb_looks', sortDir: 'desc' })
    expect(data[0].email).toBe('jane@example.com') // jane has more looks
  })
})

describe('searchCustomers (mock mode)', () => {
  it('matches on email', async () => {
    const results = await searchCustomers('jane@')
    expect(results).toHaveLength(1)
    expect(results[0].first_name).toBe('Jane')
  })
})

// NOTE: the localStorage-backed mockDb mutates module-level state across calls,
// so these assert *relative* counts rather than absolute ones.
describe('createCustomer / deleteCustomer (mock mode)', () => {
  it('creates then reads back a customer', async () => {
    const before = (await fetchCustomers()).count
    await createCustomer({
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      budget: 400,
      style_preferences: null,
      sizes: null,
      questionnaire_data: null,
    })
    const found = await fetchCustomerByEmail('new@example.com')
    expect(found?.first_name).toBe('New')
    expect((await fetchCustomers()).count).toBe(before + 1)
  })

  it('deletes a customer', async () => {
    const before = (await fetchCustomers()).count
    await deleteCustomer('john@example.com')
    expect((await fetchCustomers()).count).toBe(before - 1)
    expect(await fetchCustomerByEmail('john@example.com')).toBeNull()
  })
})
