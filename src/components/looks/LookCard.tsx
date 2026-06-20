import { useNavigate } from 'react-router-dom'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
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

  const hasProducts =
    look.left_top ||
    look.left_bottom ||
    look.right_top ||
    look.right_middle ||
    look.right_bottom

  return (
    <div className="group relative flex h-look flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Preview */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {look.thumbnail ? (
          <img
            src={look.thumbnail}
            alt={look.name || 'Look'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : hasProducts ? (
          <div className="grid h-full w-full grid-cols-2 gap-1 p-2">
            <div className="rounded bg-gray-200" />
            <div className="rounded bg-gray-200" />
            <div className="rounded bg-gray-200" />
            <div className="rounded bg-gray-200" />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300">
            <SparklesIcon className="h-9 w-9" />
            <span className="text-xs">Look vide</span>
          </div>
        )}

        {look.is_public && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
            Public
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-sm font-semibold text-gray-900">
          {look.name || 'Sans nom'}
        </p>
        {look.designer && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{look.designer}</p>
        )}

        {(look.customers_count ?? 0) > 0 && (
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-gray-500">
            <UsersIcon className="h-4 w-4" />
            <span>
              {look.customers_count} client{(look.customers_count ?? 0) > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="absolute right-2 top-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu((s) => !s)
          }}
          className={cn(
            'rounded-full bg-white/90 p-1.5 text-gray-600 shadow-sm ring-1 ring-gray-200 backdrop-blur transition',
            'hover:bg-white hover:text-gray-900',
            showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
              }}
            />
            <div className="shadow-pop absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
