import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui'
import { useSearchCustomers } from '@/hooks'
import { cn } from '@/utils/cn'
import type { Customer } from '@/types'

interface CustomerFinderProps {
  onSelect: (customer: Customer) => void
  selectedEmail?: string
}

export function CustomerFinder({ onSelect, selectedEmail }: CustomerFinderProps) {
  const [search, setSearch] = useState('')
  const { data: results = [], isLoading } = useSearchCustomers(search)

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Rechercher un client</h3>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Email du client..."
          className="pl-10"
        />
      </div>

      {/* Results */}
      {search.length >= 2 && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="py-2 text-center text-sm text-gray-500">
              Recherche...
            </div>
          ) : results.length === 0 ? (
            <div className="py-2 text-center text-sm text-gray-500">
              Aucun résultat
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((customer: Customer) => (
                <button
                  key={customer.email}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm',
                    'hover:bg-gray-100 transition-colors',
                    selectedEmail === customer.email && 'bg-brand-50 text-brand-700'
                  )}
                >
                  <p className="font-medium">{customer.email}</p>
                  {(customer.first_name || customer.last_name) && (
                    <p className="text-xs text-gray-500">
                      {[customer.first_name, customer.last_name].filter(Boolean).join(' ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
