import { useNavigate } from 'react-router-dom'
import {
  SparklesIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { useProducts, useLooks, useCustomers } from '@/hooks'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: number
  icon: typeof SparklesIcon
  href: string
  accent: string
}

function StatCard({ title, value, icon: Icon, href, accent }: StatCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(href)}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accent)}>
          <Icon className="h-6 w-6" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-500" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: products } = useProducts()
  const { data: looks } = useLooks()
  const { data: customers } = useCustomers()

  const stats: StatCardProps[] = [
    {
      title: 'Looks',
      value: looks?.count ?? 0,
      icon: SparklesIcon,
      href: '/looks',
      accent: 'bg-brand-50 text-brand-600',
    },
    {
      title: 'Produits',
      value: products?.count ?? 0,
      icon: ShoppingBagIcon,
      href: '/products',
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Utilisateurs',
      value: customers?.count ?? 0,
      icon: UsersIcon,
      href: '/users',
      accent: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="min-h-screen">
      <Toolbar title="Tableau de bord" subtitle="Vue d'ensemble de votre boutique" />

      <div className="space-y-8 p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">
              Bienvenue sur WILOOK
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Gérez vos produits, composez des looks personnalisés pour vos
              clients et suivez l'activité de votre boutique en un coup d'œil.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/products/edit')}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Nouveau produit
              </Button>
              <button
                onClick={() => navigate('/looks/edit')}
                className="inline-flex items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/25"
              >
                <SparklesIcon className="mr-2 h-5 w-5" />
                Créer un look
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
