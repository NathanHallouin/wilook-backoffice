import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import * as looksService from '@/services/looks'
import type { Look, FetchOptions } from '@/types'
import type { LookFilter } from '@/services/looks'

const QUERY_KEY = 'looks'

export function useLooks(filter: LookFilter = 'all', options?: FetchOptions) {
  return useQuery({
    queryKey: [QUERY_KEY, filter, options],
    queryFn: () => looksService.fetchLooks(filter, options),
  })
}

/** Paginated looks for infinite scroll (mirrors useInfiniteProducts). */
export function useInfiniteLooks(filter: LookFilter = 'all') {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'infinite', filter],
    queryFn: ({ pageParam }) =>
      looksService.fetchLooks(filter, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0)
      return loaded < lastPage.count ? allPages.length + 1 : undefined
    },
  })
}

export function useLook(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => looksService.fetchLookById(id!),
    enabled: !!id,
  })
}

export function useCreateLook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (look: Partial<Look>) => looksService.createLook(look),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateLook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Look> }) =>
      looksService.updateLook(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] })
    },
  })
}

export function useDeleteLook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => looksService.deleteLook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useDeleteLooks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => looksService.deleteLooks(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useCreateLookForCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => looksService.createLookForCustomer(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useAssignCustomers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lookId, emails }: { lookId: string; emails: string[] }) =>
      looksService.assignCustomersToLook(lookId, emails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useCustomerLooks(email: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'customer', email],
    queryFn: () => looksService.fetchCustomerLooks(email!),
    enabled: !!email,
  })
}

export function useLookCustomers(lookId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, lookId, 'customers'],
    queryFn: () => looksService.fetchLookCustomers(lookId!),
    enabled: !!lookId,
  })
}

export function useUploadLookThumbnail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lookId, file }: { lookId: string; file: File }) =>
      looksService.uploadLookThumbnail(lookId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.lookId] })
    },
  })
}
