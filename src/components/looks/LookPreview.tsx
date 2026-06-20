import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { LOOK_SLOTS } from '@/config/constants'
import type { Product, LookSlot } from '@/types'

interface LookPreviewProps {
  slots: Partial<Record<LookSlot, Product | null>>
  onSlotClick?: (slot: LookSlot) => void
  onDrop?: (slot: LookSlot, product: Product) => void
  onClear?: (slot: LookSlot) => void
  activeSlot?: LookSlot | null
}

const slotLabels: Record<LookSlot, string> = {
  left_top: 'Haut gauche',
  left_bottom: 'Bas gauche',
  right_top: 'Haut droit',
  right_middle: 'Milieu droit',
  right_bottom: 'Bas droit',
}

export function LookPreview({ slots, onSlotClick, onDrop, onClear, activeSlot }: LookPreviewProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-brand-500')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-brand-500')
  }

  const handleDrop = (e: React.DragEvent, slot: LookSlot) => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-brand-500')

    try {
      const productData = e.dataTransfer.getData('application/json')
      if (productData) {
        const product = JSON.parse(productData) as Product
        onDrop?.(slot, product)
      }
    } catch {
      // Invalid data
    }
  }

  const renderSlot = (slot: LookSlot, className: string) => {
    const product = slots[slot]

    return (
      <div
        key={slot}
        className={cn(
          'group relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all',
          'hover:border-brand-400 hover:bg-brand-50',
          activeSlot === slot && 'border-brand-500 bg-brand-50',
          product && 'border-solid border-gray-200 bg-gray-100',
          className
        )}
        onClick={() => onSlotClick?.(slot)}
        onContextMenu={
          product && onClear
            ? (e) => {
                e.preventDefault()
                onClear(slot)
              }
            : undefined
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slot)}
      >
        {product ? (
          <>
            <img
              src={product.thumbnail || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear(slot)
                }}
                aria-label={`Vider ${slotLabels[slot]}`}
                title="Vider ce slot (clic droit aussi)"
                className="absolute right-1 top-1 z-10 rounded-full bg-surface/90 p-1 text-gray-600 opacity-0 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:bg-surface hover:text-red-600 group-hover:opacity-100"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400 text-center p-2">
            {slotLabels[slot]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-4 shadow-card">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Prévisualisation</h3>

      {/* 5-slot layout grid */}
      <div className="grid grid-cols-2 gap-2 aspect-[4/5]">
        {/* Left column */}
        <div className="grid grid-rows-2 gap-2">
          {renderSlot(LOOK_SLOTS.LEFT_TOP as LookSlot, 'h-full')}
          {renderSlot(LOOK_SLOTS.LEFT_BOTTOM as LookSlot, 'h-full')}
        </div>

        {/* Right column */}
        <div className="grid grid-rows-3 gap-2">
          {renderSlot(LOOK_SLOTS.RIGHT_TOP as LookSlot, 'h-full')}
          {renderSlot(LOOK_SLOTS.RIGHT_MIDDLE as LookSlot, 'h-full')}
          {renderSlot(LOOK_SLOTS.RIGHT_BOTTOM as LookSlot, 'h-full')}
        </div>
      </div>
    </div>
  )
}
