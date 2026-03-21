import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as customersService from '@/services/customers'
import type { Customer, FetchOptions } from '@/types'

const QUERY_KEY = 'customers'

export function useCustomers(options?: FetchOptions) {
  return useQuery({
    queryKey: [QUERY_KEY, options],
    queryFn: () => customersService.fetchCustomers(options),
  })
}

export function useCustomer(email: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, email],
    queryFn: () => customersService.fetchCustomerByEmail(email!),
    enabled: !!email,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (customer: Omit<Customer, 'created_at' | 'updated_at'>) =>
      customersService.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, updates }: { email: string; updates: Partial<Customer> }) =>
      customersService.updateCustomer(email, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.email] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => customersService.deleteCustomer(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'search', query],
    queryFn: () => customersService.searchCustomers(query),
    enabled: query.length >= 2,
  })
}

export function useCustomerStatistics(email: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, email, 'statistics'],
    queryFn: () => customersService.fetchCustomerStatistics(email!),
    enabled: !!email,
  })
}
