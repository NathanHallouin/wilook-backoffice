import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as suggestionsService from '@/services/suggestions'
import * as looksService from '@/services/looks'
import type { Customer, Product, Look } from '@/types'

/**
 * Generate AI clothing suggestions for a customer, on demand.
 *
 * Exposed as a mutation rather than a query so it only runs when the operator
 * clicks "Générer" — the underlying call may hit the Claude edge function.
 */
export function useGenerateSuggestions() {
  return useMutation({
    mutationFn: ({ customer, products }: { customer: Customer; products: Product[] }) =>
      suggestionsService.getSuggestions(customer, products),
  })
}

/** Create a Look from a suggestion and assign it to the customer. */
export function useCreateSuggestedLook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, fields }: { email: string; fields: Partial<Look> }) =>
      looksService.createLookForCustomer(email, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['looks'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
