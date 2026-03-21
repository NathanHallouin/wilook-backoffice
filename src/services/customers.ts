import { supabase, isSupabaseConfigured } from './supabase'
import { mockDb } from './mockData'
import { TABLES, RPC_FUNCTIONS, PAGINATION } from '@/config/constants'
import type { Customer, CustomerWithStats, FetchOptions } from '@/types'

export interface FetchCustomersResult {
  data: CustomerWithStats[]
  count: number
}

export async function fetchCustomers(options?: FetchOptions): Promise<FetchCustomersResult> {
  if (!isSupabaseConfigured) {
    const customers = mockDb.getCustomers()
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE
    const start = (page - 1) * pageSize
    const paginatedCustomers = customers.slice(start, start + pageSize)
    return { data: paginatedCustomers, count: customers.length }
  }

  const page = options?.page ?? 1
  const pageSize = Math.min(options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE)

  const { data, error } = await supabase!.rpc(RPC_FUNCTIONS.GET_CUSTOMERS_WITH_STATS, {
    page_number: page,
    page_size: pageSize,
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

  const looks = data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dates = looks
    .map((l: any) => l.look?.created_at as string | undefined)
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse()

  return {
    nbLooks: looks.length,
    lastLookDate: dates[0] ?? null,
  }
}
