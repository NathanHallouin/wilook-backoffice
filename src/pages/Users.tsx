import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Input, Skeleton, EmptyState } from '@/components/ui'
import { useCustomers } from '@/hooks'
import { cn } from '@/utils/cn'

type SortColumn = 'email' | 'nb_looks' | 'last_look_date'
type SortDirection = 'asc' | 'desc'

export function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('email')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Debounce the search box before querying the server.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Search & sort are resolved server-side by the RPC.
  const { data, isLoading } = useCustomers({
    search: debouncedSearch,
    sortColumn,
    sortDir: sortDirection,
  })
  const customers = data?.data ?? []

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    )
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Utilisateurs" subtitle="Vos clients et leur activité" />

      <div className="p-6">
        {/* Search */}
        <div className="max-w-md mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {customers.length} utilisateur{customers.length > 1 ? 's' : ''}
        </p>

        {/* Table */}
        {!isLoading && customers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur"
            description="Aucun client ne correspond à votre recherche."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-card">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  {([
                    { key: 'email', label: 'Client', sortable: true },
                    { key: 'name', label: 'Nom', sortable: false },
                    { key: 'nb_looks', label: 'Looks', sortable: true },
                    { key: 'last_look_date', label: 'Dernier look', sortable: true },
                  ] as const).map((col) => (
                    <th
                      key={col.key}
                      onClick={
                        col.sortable
                          ? () => handleSort(col.key as SortColumn)
                          : undefined
                      }
                      className={cn(
                        'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500',
                        col.sortable && 'cursor-pointer select-none hover:text-gray-700'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <SortIcon column={col.key as SortColumn} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-surface">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  : customers.map((customer) => {
                      const fullName = [customer.first_name, customer.last_name]
                        .filter(Boolean)
                        .join(' ')
                      const initials =
                        (
                          (customer.first_name?.[0] ?? '') +
                          (customer.last_name?.[0] ?? '')
                        ).toUpperCase() || customer.email[0].toUpperCase()
                      return (
                        <tr
                          key={customer.email}
                          onClick={() =>
                            navigate(`/user/${encodeURIComponent(customer.email)}`)
                          }
                          className="cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                                {initials}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {customer.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                            {fullName || '-'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {customer.nb_looks}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {customer.last_look_date
                              ? new Date(customer.last_look_date).toLocaleDateString('fr-FR')
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
