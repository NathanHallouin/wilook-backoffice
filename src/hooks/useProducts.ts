import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import * as productsService from '@/services/products'
import type { Product, ProductFilters, FetchOptions } from '@/types'

const QUERY_KEY = 'products'

export function useProducts(filters?: ProductFilters, options?: FetchOptions) {
  return useQuery({
    queryKey: [QUERY_KEY, filters, options],
    queryFn: () => productsService.fetchProducts(filters, options),
  })
}

/**
 * Paginated products for infinite scroll. TanStack Query owns page
 * accumulation, so the page component needs no manual page state or effects.
 */
export function useInfiniteProducts(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filters],
    queryFn: ({ pageParam }) =>
      productsService.fetchProducts(filters, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0)
      return loaded < lastPage.count ? allPages.length + 1 : undefined
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => productsService.fetchProductById(id!),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
      productsService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      productsService.updateProduct(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      productsService.uploadProductImage(productId, file),
  })
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: productsService.fetchBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: productsService.fetchProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProductTypes() {
  return useQuery({
    queryKey: ['productTypes'],
    queryFn: productsService.fetchProductTypes,
    staleTime: 5 * 60 * 1000,
  })
}
