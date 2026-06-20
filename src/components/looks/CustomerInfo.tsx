import { CurrencyEuroIcon, SwatchIcon } from '@heroicons/react/24/outline'
import type { Customer } from '@/types'

interface CustomerInfoProps {
  customer: Customer
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Informations client</h3>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Nom non renseigné'}
          </p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </div>

        {/* Budget */}
        {customer.budget && (
          <div className="flex items-center gap-2 text-sm">
            <CurrencyEuroIcon className="h-4 w-4 text-gray-500" />
            <span>Budget: {customer.budget}€</span>
          </div>
        )}

        {/* Sizes */}
        {customer.sizes && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Tailles</p>
            <div className="flex flex-wrap gap-1">
              {customer.sizes.top && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  Haut: {customer.sizes.top}
                </span>
              )}
              {customer.sizes.bottom && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  Bas: {customer.sizes.bottom}
                </span>
              )}
              {customer.sizes.shoes && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  Chaussures: {customer.sizes.shoes}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Style preferences */}
        {customer.style_preferences && (
          <div>
            <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
              <SwatchIcon className="h-3 w-3" />
              <span>Style</span>
            </div>
            {customer.style_preferences.styles && customer.style_preferences.styles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {customer.style_preferences.styles.map((style) => (
                  <span
                    key={style}
                    className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs"
                  >
                    {style}
                  </span>
                ))}
              </div>
            )}
            {customer.style_preferences.colors && customer.style_preferences.colors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.style_preferences.colors.map((color) => (
                  <span
                    key={color}
                    className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                  >
                    {color}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
