import { useNavigate } from 'react-router-dom'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { Look } from '@/types'

interface LookCardProps {
  look: Look
  onDelete: (id: string) => void
}

export function LookCard({ look, onDelete }: LookCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleEdit = () => {
    navigate(`/looks/edit?id=${look.id}`)
    setShowMenu(false)
  }

  const handleDelete = () => {
    onDelete(look.id)
    setShowMenu(false)
  }

  const hasProducts = look.left_top || look.left_bottom || look.right_top || look.right_middle || look.right_bottom

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-look hover:shadow-md transition-shadow relative group">
      {/* Look preview */}
      <div className="h-48 bg-gray-100 relative">
        {look.thumbnail ? (
          <img
            src={look.thumbnail}
            alt={look.name || 'Look'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : hasProducts ? (
          <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
            {/* Simple 2x2 preview grid */}
            <div className="bg-gray-200 rounded" />
            <div className="bg-gray-200 rounded" />
            <div className="bg-gray-200 rounded" />
            <div className="bg-gray-200 rounded" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Look vide
          </div>
        )}

        {look.is_public && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            Public
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {look.name || 'Sans nom'}
        </p>
        {look.designer && (
          <p className="text-xs text-gray-500 mt-0.5">{look.designer}</p>
        )}

        {/* Customers count */}
        {(look.customers_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <UsersIcon className="h-4 w-4" />
            <span>{look.customers_count} client{(look.customers_count ?? 0) > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className={cn(
            'p-1 bg-white rounded-full shadow transition-opacity',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border z-10">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <PencilIcon className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
