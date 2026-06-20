import { NavLink, useNavigate } from 'react-router-dom'
import {
  Squares2X2Icon,
  SparklesIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/config/constants'
import { useAuth } from '@/components/auth/AuthProvider'

const navItems = [
  { to: ROUTES.HOME, icon: Squares2X2Icon, label: 'Tableau de bord', end: true },
  { to: ROUTES.LOOKS, icon: SparklesIcon, label: 'Looks' },
  { to: ROUTES.PRODUCTS, icon: ShoppingBagIcon, label: 'Produits' },
  { to: ROUTES.USERS, icon: UsersIcon, label: 'Utilisateurs' },
]

export function Navbar() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="fixed left-0 top-0 z-100 flex h-full w-60 flex-col border-r border-gray-200 bg-white px-3 py-4">
      {/* Brand */}
      <NavLink
        to={ROUTES.HOME}
        end
        className="mb-6 flex h-10 items-center gap-2 px-2"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white shadow-sm">
          W
        </span>
        <span className="text-base font-bold tracking-tight text-gray-900">
          WILOOK
        </span>
      </NavLink>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
        <span>Déconnexion</span>
      </button>
    </nav>
  )
}
