import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Input } from '@/components/ui'
import { useCustomers } from '@/hooks'
import { cn } from '@/utils/cn'
import type { CustomerWithStats } from '@/types'

type SortColumn = 'email' | 'nb_looks' | 'last_look_date'
type SortDirection = 'asc' | 'desc'

export function UsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('email')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { data, isLoading } = useCustomers()

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Filter and sort customers
  const customers = data?.data
    .filter((c: CustomerWithStats) => c.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a: CustomerWithStats, b: CustomerWithStats) => {
      const modifier = sortDirection === 'asc' ? 1 : -1
      switch (sortColumn) {
        case 'email':
          return a.email.localeCompare(b.email) * modifier
        case 'nb_looks':
          return (a.nb_looks - b.nb_looks) * modifier
        case 'last_look_date':
          if (!a.last_look_date) return 1 * modifier
          if (!b.last_look_date) return -1 * modifier
          return a.last_look_date.localeCompare(b.last_look_date) * modifier
        default:
          return 0
      }
    }) ?? []

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
      <Toolbar title="Utilisateurs" />

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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email
                    <SortIcon column="email" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nb_looks')}
                >
                  <div className="flex items-center gap-1">
                    Looks
                    <SortIcon column="nb_looks" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_look_date')}
                >
                  <div className="flex items-center gap-1">
                    Dernier look
                    <SortIcon column="last_look_date" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.email}
                    onClick={() => navigate(`/user/${encodeURIComponent(customer.email)}`)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      'hover:bg-gray-50'
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-indigo-600">
                        {customer.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {[customer.first_name, customer.last_name]
                        .filter(Boolean)
                        .join(' ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.nb_looks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.last_look_date
                        ? new Date(customer.last_look_date).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
