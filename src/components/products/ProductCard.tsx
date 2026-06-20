import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { PRODUCT_CATEGORY_LABELS } from '@/config/constants'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onDelete: (id: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, product: Product) => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

const priceFmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export function ProductCard({
  product,
  onDelete,
  draggable = false,
  onDragStart,
  selectable = false,
  selected = false,
  onToggleSelect,
}: ProductCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  // Close the actions menu on Escape.
  useEffect(() => {
    if (!showMenu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showMenu])

  const handleEdit = () => {
    navigate(`/products/edit?id=${product.id}`)
    setShowMenu(false)
  }

  const handleDelete = () => {
    onDelete(product.id)
    setShowMenu(false)
  }

  const onSale = product.final_price != null && product.final_price < product.price
  const discount = onSale
    ? Math.round((1 - product.final_price! / product.price) * 100)
    : 0

  return (
    <div
      className={cn(
        'group relative flex h-card flex-col overflow-hidden rounded-2xl border bg-white',
        'shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        selected ? 'border-brand-500 ring-2 ring-brand-500' : 'border-gray-200',
        draggable && 'cursor-grab active:cursor-grabbing',
        selectable && 'cursor-pointer'
      )}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, product)}
      onClick={selectable ? () => onToggleSelect?.(product.id) : undefined}
    >
      {/* Selection checkbox */}
      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect?.(product.id)
          }}
          aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
          aria-pressed={selected}
          className={cn(
            'absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 backdrop-blur transition',
            selected
              ? 'border-brand-600 bg-brand-600 text-white opacity-100'
              : 'border-gray-300 bg-white/90 text-transparent opacity-0 group-hover:opacity-100'
          )}
        >
          <CheckIcon className="h-4 w-4" strokeWidth={3} />
        </button>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300">
            <PhotoIcon className="h-10 w-10" />
            <span className="text-xs">Pas d'image</span>
          </div>
        )}

        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {PRODUCT_CATEGORY_LABELS[product.category]}
          {product.type ? ` · ${product.type}` : ''}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
          {product.title}
        </p>
        {product.brand && (
          <p className="truncate text-xs text-gray-500">{product.brand}</p>
        )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600"
              >
                {color}
              </span>
            ))}
            {product.colors.length > 3 && (
              <span className="px-1 py-0.5 text-[11px] text-gray-400">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          {onSale ? (
            <>
              <span className="text-sm font-semibold text-red-600">
                {priceFmt.format(product.final_price!)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {priceFmt.format(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {priceFmt.format(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="absolute right-2 top-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu((s) => !s)
          }}
          aria-label="Actions du produit"
          aria-haspopup="true"
          aria-expanded={showMenu}
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
            <div
              role="menu"
              className="shadow-pop absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1"
            >
              <button
                role="menuitem"
                onClick={handleEdit}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4" />
                Modifier
              </button>
              <button
                role="menuitem"
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
