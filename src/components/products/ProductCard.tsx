import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { PRODUCT_CATEGORY_LABELS } from '@/config/constants'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onDelete: (id: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, product: Product) => void
}

export function ProductCard({
  product,
  onDelete,
  draggable = false,
  onDragStart,
}: ProductCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleEdit = () => {
    navigate(`/products/edit?id=${product.id}`)
    setShowMenu(false)
  }

  const handleDelete = () => {
    onDelete(product.id)
    setShowMenu(false)
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-card',
        'hover:shadow-md transition-shadow relative group',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, product)}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-gray-500 uppercase">
          {PRODUCT_CATEGORY_LABELS[product.category]} - {product.type}
        </p>
        <p className="text-sm font-medium text-gray-900 truncate mt-1">
          {product.brand}
        </p>

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="text-xs px-1.5 py-0.5 bg-gray-100 rounded"
              >
                {color}
              </span>
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          {product.final_price && product.final_price < product.price ? (
            <>
              <span className="text-sm font-semibold text-red-600">
                {product.final_price}€
              </span>
              <span className="text-xs text-gray-400 line-through">
                {product.price}€
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {product.price}€
            </span>
          )}
        </div>
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
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
