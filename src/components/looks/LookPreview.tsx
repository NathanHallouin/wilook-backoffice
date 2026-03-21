import { cn } from '@/utils/cn'
import { LOOK_SLOTS } from '@/config/constants'
import type { Product, LookSlot } from '@/types'

interface LookPreviewProps {
  slots: Partial<Record<LookSlot, Product | null>>
  onSlotClick?: (slot: LookSlot) => void
  onDrop?: (slot: LookSlot, product: Product) => void
  activeSlot?: LookSlot | null
}

const slotLabels: Record<LookSlot, string> = {
  left_top: 'Haut gauche',
  left_bottom: 'Bas gauche',
  right_top: 'Haut droit',
  right_middle: 'Milieu droit',
  right_bottom: 'Bas droit',
}

export function LookPreview({ slots, onSlotClick, onDrop, activeSlot }: LookPreviewProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-indigo-500')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-500')
  }

  const handleDrop = (e: React.DragEvent, slot: LookSlot) => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-500')

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
          'bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative',
          'flex items-center justify-center cursor-pointer transition-all',
          'hover:border-indigo-400 hover:bg-indigo-50',
          activeSlot === slot && 'border-indigo-500 bg-indigo-50',
          product && 'border-solid border-gray-200',
          className
        )}
        onClick={() => onSlotClick?.(slot)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slot)}
      >
        {product ? (
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-xs text-gray-400 text-center p-2">
            {slotLabels[slot]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
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
