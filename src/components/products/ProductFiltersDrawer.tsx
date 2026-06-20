import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { Accordion, Checkbox, Input } from '@/components/ui'
import { PRODUCT_CATEGORY_LABELS } from '@/config/constants'
import { CLOTHING_SIZES, SHOE_SIZES } from '@/config/formValues'
import type { ProductFilters, ProductCategory } from '@/types'

interface ProductFiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  availableTypes: string[]
  availableBrands: string[]
  availableColors: string[]
  availableMaterials: string[]
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'top', label: PRODUCT_CATEGORY_LABELS.top },
  { value: 'bottom', label: PRODUCT_CATEGORY_LABELS.bottom },
  { value: 'shoes', label: PRODUCT_CATEGORY_LABELS.shoes },
  { value: 'accessories', label: PRODUCT_CATEGORY_LABELS.accessories },
  { value: 'set', label: PRODUCT_CATEGORY_LABELS.set },
]

export function ProductFiltersDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableTypes,
  availableBrands,
  availableColors,
  availableMaterials,
}: ProductFiltersDrawerProps) {
  const toggleArrayFilter = (
    key: keyof ProductFilters,
    value: string,
    checked: boolean
  ) => {
    const current = (filters[key] as string[] | undefined) || []
    const updated = checked
      ? [...current, value]
      : current.filter((v) => v !== value)

    onFiltersChange({
      ...filters,
      [key]: updated.length > 0 ? updated : undefined,
    })
  }

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    onFiltersChange({
      ...filters,
      category: checked ? category : undefined,
    })
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'shadow-pop fixed right-0 top-0 z-50 h-full w-80 border-l border-gray-200 bg-white',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Filtres
          </h2>
          <button
            onClick={onClose}
            className="-mr-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          {/* Category */}
          <Accordion title="Catégorie" defaultOpen>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Checkbox
                  key={cat.value}
                  label={cat.label}
                  checked={filters.category === cat.value}
                  onChange={(checked) => handleCategoryChange(cat.value, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Types */}
          <Accordion title="Types">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTypes.map((type) => (
                <Checkbox
                  key={type}
                  label={type}
                  checked={filters.types?.includes(type) || false}
                  onChange={(checked) => toggleArrayFilter('types', type, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Brands */}
          <Accordion title="Marques">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  checked={filters.brands?.includes(brand) || false}
                  onChange={(checked) => toggleArrayFilter('brands', brand, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Colors */}
          <Accordion title="Couleurs">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableColors.map((color) => (
                <Checkbox
                  key={color}
                  label={color}
                  checked={filters.colors?.includes(color) || false}
                  onChange={(checked) => toggleArrayFilter('colors', color, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Materials */}
          <Accordion title="Matières">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableMaterials.map((material) => (
                <Checkbox
                  key={material}
                  label={material}
                  checked={filters.materials?.includes(material) || false}
                  onChange={(checked) => toggleArrayFilter('materials', material, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Sizes */}
          <Accordion title="Tailles">
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {CLOTHING_SIZES.map((size) => (
                <Checkbox
                  key={size}
                  label={size}
                  checked={filters.sizes?.includes(size) || false}
                  onChange={(checked) => toggleArrayFilter('sizes', size, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Shoe sizes */}
          <Accordion title="Pointures">
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {SHOE_SIZES.map((size) => (
                <Checkbox
                  key={size}
                  label={size}
                  checked={filters.shoeSizes?.includes(size) || false}
                  onChange={(checked) => toggleArrayFilter('shoeSizes', size, checked)}
                />
              ))}
            </div>
          </Accordion>

          {/* Promotion */}
          <Accordion title="Promotion">
            <Checkbox
              label="En promo uniquement"
              checked={filters.onSale || false}
              onChange={(checked) =>
                onFiltersChange({ ...filters, onSale: checked || undefined })
              }
            />
          </Accordion>

          {/* Price range */}
          <Accordion title="Prix">
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </Accordion>
        </div>
      </div>
    </>
  )
}
