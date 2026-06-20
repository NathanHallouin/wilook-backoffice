import { supabase, isSupabaseConfigured } from './supabase'
import { mockDb } from './mockData'
import { TABLES, STORAGE_BUCKETS, PAGINATION } from '@/config/constants'
import { processImage } from '@/utils/image'
import type { Product, ProductFilters, FetchOptions } from '@/types'

export interface FetchProductsResult {
  data: Product[]
  count: number
}

export async function fetchProducts(
  filters?: ProductFilters,
  options?: FetchOptions
): Promise<FetchProductsResult> {
  // Mock mode
  if (!isSupabaseConfigured) {
    let products = mockDb.getProducts()

    // Apply filters
    if (filters?.category) {
      products = products.filter(p => p.category === filters.category)
    }
    if (filters?.types?.length) {
      products = products.filter(p => filters.types!.includes(p.type))
    }
    if (filters?.brands?.length) {
      products = products.filter(p => p.brand && filters.brands!.includes(p.brand))
    }
    if (filters?.colors?.length) {
      products = products.filter(p => p.colors.some(c => filters.colors!.includes(c)))
    }
    if (filters?.materials?.length) {
      products = products.filter(p => p.materials.some(m => filters.materials!.includes(m)))
    }
    if (filters?.sizes?.length) {
      products = products.filter(p => p.sizes.some(s => filters.sizes!.includes(s)))
    }
    if (filters?.shoeSizes?.length) {
      products = products.filter(p => p.shoe_sizes.some(s => filters.shoeSizes!.includes(s)))
    }
    if (filters?.minPrice !== undefined) {
      products = products.filter(p => p.price >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filters.maxPrice!)
    }
    if (filters?.onSale) {
      products = products.filter(p => p.final_price != null && p.final_price < p.price)
    }

    // Pagination
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE
    const start = (page - 1) * pageSize
    const paginatedProducts = products.slice(start, start + pageSize)

    return { data: paginatedProducts, count: products.length }
  }

  // Supabase mode
  const page = options?.page ?? 1
  const pageSize = Math.min(options?.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE)
  const offset = (page - 1) * pageSize

  let query = supabase!
    .from(TABLES.PRODUCTS)
    .select('*', { count: 'exact' })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.types?.length) {
    query = query.in('type', filters.types)
  }
  if (filters?.brands?.length) {
    query = query.in('brand', filters.brands)
  }
  if (filters?.colors?.length) {
    query = query.overlaps('colors', filters.colors)
  }
  if (filters?.materials?.length) {
    query = query.overlaps('materials', filters.materials)
  }
  if (filters?.details?.length) {
    query = query.overlaps('details', filters.details)
  }
  if (filters?.sizes?.length) {
    query = query.overlaps('sizes', filters.sizes)
  }
  if (filters?.shoeSizes?.length) {
    query = query.overlaps('shoe_sizes', filters.shoeSizes)
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }
  if (filters?.onSale) {
    // "En promo" = un prix promo est défini (le seed garantit final_price < price).
    query = query.not('final_price', 'is', null)
  }

  if (options?.sort) {
    query = query.order(options.sort.column, { ascending: options.sort.ascending ?? true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return { data: data ?? [], count: count ?? 0 }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return mockDb.getProducts().find(p => p.id === id) || null
  }

  const { data, error } = await supabase!
    .from(TABLES.PRODUCTS)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch product: ${error.message}`)
  }

  return data
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  if (!isSupabaseConfigured) {
    return mockDb.addProduct(product)
  }

  const { data, error } = await supabase!
    .from(TABLES.PRODUCTS)
    .insert(product)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  return data
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured) {
    const updated = mockDb.updateProduct(id, updates)
    if (!updated) throw new Error('Product not found')
    return updated
  }

  const { data, error } = await supabase!
    .from(TABLES.PRODUCTS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }

  return data
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    mockDb.deleteProduct(id)
    return
  }

  const { error } = await supabase!
    .from(TABLES.PRODUCTS)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  if (!isSupabaseConfigured) {
    ids.forEach(id => mockDb.deleteProduct(id))
    return
  }

  const { error } = await supabase!
    .from(TABLES.PRODUCTS)
    .delete()
    .in('id', ids)

  if (error) {
    throw new Error(`Failed to delete products: ${error.message}`)
  }
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    // Return a blob URL for mock mode
    return URL.createObjectURL(file)
  }

  const processed = await processImage(file)
  const ext = processed.type === 'image/webp' ? 'webp' : processed.name.split('.').pop()
  const fileName = `${productId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase!.storage
    .from(STORAGE_BUCKETS.PRODUCTS_IMAGES)
    .upload(fileName, processed, { contentType: processed.type })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  const { data } = supabase!.storage
    .from(STORAGE_BUCKETS.PRODUCTS_IMAGES)
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function fetchBrands(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const products = mockDb.getProducts()
    return [...new Set(products.map(p => p.brand).filter(Boolean) as string[])]
  }

  const { data, error } = await supabase!
    .from('brands')
    .select('brand')

  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`)
  }

  return data?.map(d => d.brand).filter(Boolean) ?? []
}

export async function fetchProviders(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const products = mockDb.getProducts()
    return [...new Set(products.map(p => p.provider).filter(Boolean) as string[])]
  }

  const { data, error } = await supabase!
    .from('providers')
    .select('provider')

  if (error) {
    throw new Error(`Failed to fetch providers: ${error.message}`)
  }

  return data?.map(d => d.provider).filter(Boolean) ?? []
}

export async function fetchProductTypes(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const products = mockDb.getProducts()
    return [...new Set(products.map(p => p.type).filter(Boolean))]
  }

  const { data, error } = await supabase!
    .from(TABLES.PRODUCTS)
    .select('type')

  if (error) {
    throw new Error(`Failed to fetch types: ${error.message}`)
  }

  const types = [...new Set(data?.map(d => d.type).filter(Boolean))]
  return types
}
