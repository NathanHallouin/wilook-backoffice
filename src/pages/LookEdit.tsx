import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FunnelIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button, Input, Checkbox } from '@/components/ui'
import { LookPreview, CustomerFinder, CustomerInfo } from '@/components/looks'
import { ProductCard, ProductFiltersDrawer } from '@/components/products'
import {
  useLook,
  useCreateLook,
  useUpdateLook,
  useProducts,
  useBrands,
  useProductTypes,
  useAssignCustomers,
} from '@/hooks'
import { useSnackbarStore, useInterfaceStore } from '@/stores'
import { getErrorMessage } from '@/utils/error'
import { COLORS, MATERIALS } from '@/config/formValues'
import type { Product, ProductFilters, LookSlot, Customer } from '@/types'

type Slots = Partial<Record<LookSlot, Product | null>>

export function LookEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lookId = searchParams.get('id')
  const isEditing = !!lookId

  const { success, error: showError } = useSnackbarStore()
  const { filtersOpen, setFiltersOpen } = useInterfaceStore()

  const { data: existingLook, isLoading } = useLook(lookId ?? undefined)
  const createLook = useCreateLook()
  const updateLook = useUpdateLook()
  const assignCustomers = useAssignCustomers()

  // Form state
  const [name, setName] = useState('')
  const [designer, setDesigner] = useState('')
  const [universe, setUniverse] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [slots, setSlots] = useState<Slots>({})
  const [history, setHistory] = useState<Slots[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Products for drag
  const [productFilters, setProductFilters] = useState<ProductFilters>({})
  const { data: productsData } = useProducts(productFilters, { pageSize: 50 })
  const { data: brands = [] } = useBrands()
  const { data: types = [] } = useProductTypes()

  // Hydrate the form from the loaded look (and when switching looks).
  // Guarded render-time state adjustment — see https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  if (existingLook && hydratedId !== existingLook.id) {
    setHydratedId(existingLook.id)
    setName(existingLook.name || '')
    setDesigner(existingLook.designer || '')
    setUniverse(existingLook.universe || '')
    setIsPublic(existingLook.is_public)
    setSlots({
      left_top: existingLook.left_top_product || null,
      left_bottom: existingLook.left_bottom_product || null,
      right_top: existingLook.right_top_product || null,
      right_middle: existingLook.right_middle_product || null,
      right_bottom: existingLook.right_bottom_product || null,
    })
    setHistory([])
  }

  const handleDrop = useCallback(
    (slot: LookSlot, product: Product) => {
      setHistory((h) => [...h, slots])
      setSlots((prev) => ({ ...prev, [slot]: product }))
    },
    [slots]
  )

  const handleClearSlot = useCallback(
    (slot: LookSlot) => {
      if (!slots[slot]) return
      setHistory((h) => [...h, slots])
      setSlots((prev) => ({ ...prev, [slot]: null }))
    },
    [slots]
  )

  const canUndo = history.length > 0

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    setSlots(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
  }, [history])

  // Ctrl/Cmd+Z annule la dernière modification de composition
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleUndo])

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('application/json', JSON.stringify(product))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleSubmit = async () => {
    try {
      const lookData = {
        name: name || null,
        designer: designer || null,
        universe: universe || null,
        is_public: isPublic,
        left_top: slots.left_top?.id || null,
        left_bottom: slots.left_bottom?.id || null,
        right_top: slots.right_top?.id || null,
        right_middle: slots.right_middle?.id || null,
        right_bottom: slots.right_bottom?.id || null,
      }

      let newLookId: string

      if (isEditing && lookId) {
        await updateLook.mutateAsync({ id: lookId, updates: lookData })
        newLookId = lookId
      } else {
        const newLook = await createLook.mutateAsync(lookData)
        newLookId = newLook.id
      }

      // Assign customer if selected
      if (selectedCustomer) {
        await assignCustomers.mutateAsync({
          lookId: newLookId,
          emails: [selectedCustomer.email],
        })
      }

      success(isEditing ? 'Look mis à jour' : 'Look créé')
      navigate('/looks')
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toolbar title={isEditing ? 'Modifier le look' : 'Créer un look'}>
        <Button
          variant="ghost"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filtres produits
        </Button>
        <Button
          variant="ghost"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Annuler la dernière modification (Ctrl/Cmd+Z)"
        >
          <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
          Annuler la composition
        </Button>
        <Button variant="ghost" onClick={() => navigate('/looks')}>
          Quitter
        </Button>
        <Button
          onClick={handleSubmit}
          loading={createLook.isPending || updateLook.isPending}
        >
          Enregistrer
        </Button>
      </Toolbar>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Customer & Preview */}
          <div className="lg:col-span-3 space-y-4">
            <CustomerFinder
              onSelect={setSelectedCustomer}
              selectedEmail={selectedCustomer?.email}
            />

            {selectedCustomer && <CustomerInfo customer={selectedCustomer} />}

            <LookPreview slots={slots} onDrop={handleDrop} onClear={handleClearSlot} />

            {/* Look info */}
            <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Informations</h3>
              <Input
                label="Nom du look"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Casual Friday"
              />
              <Input
                label="Designer"
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
              />
              <Input
                label="Univers"
                value={universe}
                onChange={(e) => setUniverse(e.target.value)}
                placeholder="Ex: Casual, Business..."
              />
              <Checkbox
                label="Look public"
                checked={isPublic}
                onChange={setIsPublic}
              />
            </div>
          </div>

          {/* Right - Products grid */}
          <div className="lg:col-span-9">
            <div className="rounded-2xl border border-gray-200 bg-surface shadow-card p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Glissez les produits vers le look
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {productsData?.count ?? 0} produits disponibles
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productsData?.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={() => {}}
                    draggable
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductFiltersDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={productFilters}
        onFiltersChange={setProductFilters}
        availableTypes={types}
        availableBrands={brands}
        availableColors={[...COLORS]}
        availableMaterials={[...MATERIALS]}
      />
    </div>
  )
}
