import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { Accordion, Checkbox, Input } from '@/components/ui'
import { PRODUCT_CATEGORY_LABELS } from '@/config/constants'
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
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filtres</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
