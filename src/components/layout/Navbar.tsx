import { NavLink } from 'react-router-dom'
import {
  SparklesIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/config/constants'

const navItems = [
  { to: ROUTES.LOOKS, icon: SparklesIcon, label: 'Looks' },
  { to: ROUTES.PRODUCTS, icon: ShoppingBagIcon, label: 'Produits' },
  { to: ROUTES.USERS, icon: UsersIcon, label: 'Utilisateurs' },
]

export function Navbar() {
  return (
    <nav className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-100">
      {/* Logo */}
      <NavLink
        to={ROUTES.HOME}
        className="mb-8 text-xl font-bold text-indigo-600"
      >
        W
      </NavLink>

      {/* Navigation items */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'p-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )
            }
            title={item.label}
          >
            <item.icon className="h-6 w-6" />
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <button
        className="p-3 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        title="Déconnexion"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6" />
      </button>
    </nav>
  )
}
