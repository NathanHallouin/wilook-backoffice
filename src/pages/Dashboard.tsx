import { useNavigate } from 'react-router-dom'
import {
  SparklesIcon,
  ShoppingBagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { useProducts, useLooks, useCustomers } from '@/hooks'

interface StatCardProps {
  title: string
  value: number
  icon: typeof SparklesIcon
  href: string
  color: string
}

function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(href)}
      className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </button>
  )
}

export function DashboardPage() {
  const { data: products } = useProducts()
  const { data: looks } = useLooks()
  const { data: customers } = useCustomers()

  const stats: StatCardProps[] = [
    {
      title: 'Looks',
      value: looks?.count ?? 0,
      icon: SparklesIcon,
      href: '/looks',
      color: 'bg-purple-500',
    },
    {
      title: 'Produits',
      value: products?.count ?? 0,
      icon: ShoppingBagIcon,
      href: '/products',
      color: 'bg-indigo-500',
    },
    {
      title: 'Utilisateurs',
      value: customers?.count ?? 0,
      icon: UsersIcon,
      href: '/users',
      color: 'bg-blue-500',
    },
  ]

  return (
    <div className="min-h-screen">
      <Toolbar title="Tableau de bord" />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Welcome section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenue sur WILOOK Backoffice
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Gérez vos produits, créez des looks personnalisés pour vos clients,
            et suivez l'activité de votre boutique.
          </p>
        </div>
      </div>
    </div>
  )
}
