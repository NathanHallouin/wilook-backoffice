import { supabase, isSupabaseConfigured } from './supabase'
import { mockDb } from './mockData'
import { TABLES, RPC_FUNCTIONS, PAGINATION } from '@/config/constants'
import type { Customer, CustomerWithStats } from '@/types'

export interface FetchCustomersResult {
  data: CustomerWithStats[]
  count: number
}

export type CustomerSortColumn =
  | 'email'
  | 'nb_looks'
  | 'last_look_date'
  | 'created_at'

export interface FetchCustomersParams {
  page?: number
  pageSize?: number
  search?: string
  sortColumn?: CustomerSortColumn
  sortDir?: 'asc' | 'desc'
}

export async function fetchCustomers(
  params?: FetchCustomersParams
): Promise<FetchCustomersResult> {
  const page = params?.page ?? 1
  const pageSize = Math.min(
    params?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE,
    PAGINATION.MAX_PAGE_SIZE
  )
  const search = params?.search?.trim() ?? ''
  const sortColumn = params?.sortColumn ?? 'created_at'
  const sortDir = params?.sortDir ?? 'desc'

  // Mock mode: search + sort client-side for parity.
  if (!isSupabaseConfigured) {
    let customers = mockDb.getCustomers()
    if (search) {
      const q = search.toLowerCase()
      customers = customers.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          (c.first_name ?? '').toLowerCase().includes(q) ||
          (c.last_name ?? '').toLowerCase().includes(q)
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    customers = [...customers].sort((a, b) => {
      switch (sortColumn) {
        case 'email':
          return a.email.localeCompare(b.email) * dir
        case 'nb_looks':
          return (a.nb_looks - b.nb_looks) * dir
        case 'last_look_date':
          return ((a.last_look_date ?? '').localeCompare(b.last_look_date ?? '')) * dir
        default:
          return a.created_at.localeCompare(b.created_at) * -1
      }
    })
    const start = (page - 1) * pageSize
    return {
      data: customers.slice(start, start + pageSize),
      count: customers.length,
    }
  }

  const { data, error } = await supabase!.rpc(RPC_FUNCTIONS.GET_CUSTOMERS_WITH_STATS, {
    page_number: page,
    page_size: pageSize,
    search: search || null,
    sort_column: sortColumn,
    sort_dir: sortDir,
  })

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return {
    data: data ?? [],
    count: data?.length ?? 0,
  }
}

export async function fetchCustomerByEmail(email: string): Promise<Customer | null> {
  if (!isSupabaseConfigured) {
    return mockDb.getCustomers().find(c => c.email === email) || null
  }

  const { data, error } = await supabase!
    .from(TABLES.PROFILES)
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch customer: ${error.message}`)
  }

  return data
}

export async function createCustomer(customer: Omit<Customer, 'created_at' | 'updated_at'>): Promise<Customer> {
  if (!isSupabaseConfigured) {
    const newCustomer: CustomerWithStats = {
      ...customer,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nb_looks: 0,
      last_look_date: null,
    }
    const customers = mockDb.getCustomers()
    customers.push(newCustomer)
    mockDb.setCustomers(customers)
    return newCustomer
  }

  const { data, error } = await supabase!
    .from(TABLES.PROFILES)
    .insert(customer)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`)
  }

  return data
}

export async function updateCustomer(email: string, updates: Partial<Customer>): Promise<Customer> {
  if (!isSupabaseConfigured) {
    const customers = mockDb.getCustomers()
    const index = customers.findIndex(c => c.email === email)
    if (index === -1) throw new Error('Customer not found')
    customers[index] = { ...customers[index], ...updates, updated_at: new Date().toISOString() }
    mockDb.setCustomers(customers)
    return customers[index]
  }

  const { data, error } = await supabase!
    .from(TABLES.PROFILES)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`)
  }

  return data
}

export async function deleteCustomer(email: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const customers = mockDb.getCustomers()
    mockDb.setCustomers(customers.filter(c => c.email !== email))
    return
  }

  const { error } = await supabase!
    .from(TABLES.PROFILES)
    .delete()
    .eq('email', email)

  if (error) {
    throw new Error(`Failed to delete customer: ${error.message}`)
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  if (!isSupabaseConfigured) {
    const customers = mockDb.getCustomers()
    return customers.filter(c => c.email.toLowerCase().includes(query.toLowerCase()))
  }

  const { data, error } = await supabase!
    .from(TABLES.PROFILES)
    .select('*')
    .ilike('email', `%${query}%`)
    .limit(10)

  if (error) {
    throw new Error(`Failed to search customers: ${error.message}`)
  }

  return data ?? []
}

export async function fetchCustomerStatistics(email: string): Promise<{ nbLooks: number; lastLookDate: string | null }> {
  if (!isSupabaseConfigured) {
    const customer = mockDb.getCustomers().find(c => c.email === email)
    return {
      nbLooks: customer?.nb_looks ?? 0,
      lastLookDate: customer?.last_look_date ?? null,
    }
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS_PROFILES)
    .select('look:looks(created_at)')
    .eq('profile_email', email)

  if (error) {
    throw new Error(`Failed to fetch customer statistics: ${error.message}`)
  }

  // PostgREST returns the to-one `look` embed as an object at runtime, though
  // the inferred Supabase type widens it to an array — bridge via `unknown`.
  const looks = (data ?? []) as unknown as { look: { created_at: string } | null }[]
  const dates = looks
    .map((l) => l.look?.created_at)
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse()

  return {
    nbLooks: looks.length,
    lastLookDate: dates[0] ?? null,
  }
}
