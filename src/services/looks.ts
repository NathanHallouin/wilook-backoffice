import { supabase, isSupabaseConfigured } from './supabase'
import { mockDb } from './mockData'
import { TABLES, RPC_FUNCTIONS, STORAGE_BUCKETS, PAGINATION } from '@/config/constants'
import type { Look, LookWithProducts, FetchOptions } from '@/types'

export interface FetchLooksResult {
  data: Look[]
  count: number
}

export type LookFilter = 'all' | 'public' | 'unused'

export async function fetchLooks(
  filter: LookFilter = 'all',
  options?: FetchOptions
): Promise<FetchLooksResult> {
  // Mock mode
  if (!isSupabaseConfigured) {
    let looks = mockDb.getLooks()

    if (filter === 'public') {
      looks = looks.filter(l => l.is_public)
    } else if (filter === 'unused') {
      looks = looks.filter(l => (l.customers_count ?? 0) === 0)
    }

    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE
    const start = (page - 1) * pageSize
    const paginatedLooks = looks.slice(start, start + pageSize)

    return { data: paginatedLooks, count: looks.length }
  }

  // Supabase mode
  const page = options?.page ?? 1
  const pageSize = Math.min(options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE)

  if (filter === 'unused') {
    const { data, error } = await supabase!.rpc(RPC_FUNCTIONS.GET_UNUSED_LOOKS)
    if (error) throw new Error(`Failed to fetch unused looks: ${error.message}`)
    return { data: data ?? [], count: data?.length ?? 0 }
  }

  let query = supabase!
    .from(TABLES.LOOKS)
    .select('*', { count: 'exact' })

  if (filter === 'public') {
    query = query.eq('is_public', true)
  }

  if (options?.sort) {
    query = query.order(options.sort.column, { ascending: options.sort.ascending ?? true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const offset = (page - 1) * pageSize
  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch looks: ${error.message}`)
  }

  return { data: data ?? [], count: count ?? 0 }
}

export async function fetchLookById(id: string): Promise<LookWithProducts | null> {
  if (!isSupabaseConfigured) {
    const look = mockDb.getLooks().find(l => l.id === id)
    if (!look) return null

    const products = mockDb.getProducts()
    return {
      ...look,
      left_top_product: look.left_top ? products.find(p => p.id === look.left_top) || null : null,
      left_bottom_product: look.left_bottom ? products.find(p => p.id === look.left_bottom) || null : null,
      right_top_product: look.right_top ? products.find(p => p.id === look.right_top) || null : null,
      right_middle_product: look.right_middle ? products.find(p => p.id === look.right_middle) || null : null,
      right_bottom_product: look.right_bottom ? products.find(p => p.id === look.right_bottom) || null : null,
      products: [],
    }
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS)
    .select(`
      *,
      left_top_product:products!looks_left_top_fkey(*),
      left_bottom_product:products!looks_left_bottom_fkey(*),
      right_top_product:products!looks_right_top_fkey(*),
      right_middle_product:products!looks_right_middle_fkey(*),
      right_bottom_product:products!looks_right_bottom_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch look: ${error.message}`)
  }

  return data
}

export async function createLook(look: Partial<Look>): Promise<Look> {
  if (!isSupabaseConfigured) {
    return mockDb.addLook(look)
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS)
    .insert(look)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create look: ${error.message}`)
  }

  return data
}

export async function updateLook(id: string, updates: Partial<Look>): Promise<Look> {
  if (!isSupabaseConfigured) {
    const updated = mockDb.updateLook(id, updates)
    if (!updated) throw new Error('Look not found')
    return updated
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update look: ${error.message}`)
  }

  return data
}

export async function deleteLook(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    mockDb.deleteLook(id)
    return
  }

  const { error } = await supabase!
    .from(TABLES.LOOKS)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete look: ${error.message}`)
  }
}

export async function createLookForCustomer(email: string): Promise<Look> {
  const look = await createLook({})
  await assignCustomersToLook(look.id, [email])
  return look
}

export async function assignCustomersToLook(lookId: string, emails: string[]): Promise<void> {
  if (!isSupabaseConfigured) {
    // Mock: just update the look's customer count
    const look = mockDb.getLooks().find(l => l.id === lookId)
    if (look) {
      mockDb.updateLook(lookId, { customers_count: (look.customers_count ?? 0) + emails.length })
    }
    return
  }

  const assignments = emails.map(email => ({
    look_id: lookId,
    profile_email: email,
  }))

  const { error } = await supabase!
    .from(TABLES.LOOKS_PROFILES)
    .upsert(assignments)

  if (error) {
    throw new Error(`Failed to assign customers: ${error.message}`)
  }
}

export async function fetchCustomerLooks(email: string): Promise<Look[]> {
  if (!isSupabaseConfigured) {
    // Mock: return looks that have customers_count > 0
    return mockDb.getLooks().filter(l => (l.customers_count ?? 0) > 0)
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS_PROFILES)
    .select(`
      look:looks(*)
    `)
    .eq('profile_email', email)

  if (error) {
    throw new Error(`Failed to fetch customer looks: ${error.message}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data?.map((d: any) => d.look).filter(Boolean) ?? []) as Look[]
}

export async function uploadLookThumbnail(lookId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    return URL.createObjectURL(file)
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${lookId}/thumbnail.${fileExt}`

  const { error: uploadError } = await supabase!.storage
    .from(STORAGE_BUCKETS.LOOKS_IMAGES)
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Failed to upload thumbnail: ${uploadError.message}`)
  }

  const { data } = supabase!.storage
    .from(STORAGE_BUCKETS.LOOKS_IMAGES)
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function fetchLookCustomers(lookId: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    // Mock: return some customer emails
    const look = mockDb.getLooks().find(l => l.id === lookId)
    if (look && (look.customers_count ?? 0) > 0) {
      return mockDb.getCustomers().slice(0, look.customers_count).map(c => c.email)
    }
    return []
  }

  const { data, error } = await supabase!
    .from(TABLES.LOOKS_PROFILES)
    .select('profile_email')
    .eq('look_id', lookId)

  if (error) {
    throw new Error(`Failed to fetch look customers: ${error.message}`)
  }

  return data?.map(d => d.profile_email) ?? []
}
