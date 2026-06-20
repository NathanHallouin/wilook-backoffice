import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FunnelIcon,
  PlusIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button, CardGridSkeleton, EmptyState, SelectionBar, useConfirm } from '@/components/ui'
import { ProductCard, ProductFiltersDrawer } from '@/components/products'
import {
  useInfiniteProducts,
  useBrands,
  useProductTypes,
  useDeleteProduct,
  useDeleteProducts,
  useSelection,
} from '@/hooks'
import { useSnackbarStore, useInterfaceStore } from '@/stores'
import { COLORS, MATERIALS } from '@/config/formValues'
import { getErrorMessage } from '@/utils/error'
import type { ProductFilters } from '@/types'

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { filtersOpen, setFiltersOpen } = useInterfaceStore()
  const { success, error: showError } = useSnackbarStore()

  const loaderRef = useRef<HTMLDivElement>(null)

  // Parse filters from URL
  const filters: ProductFilters = {
    types: searchParams.get('types')?.split(',').filter(Boolean),
    brands: searchParams.get('brands')?.split(',').filter(Boolean),
    colors: searchParams.get('colors')?.split(',').filter(Boolean),
    materials: searchParams.get('materials')?.split(',').filter(Boolean),
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean),
    shoeSizes: searchParams.get('shoesizes')?.split(',').filter(Boolean),
    minPrice: searchParams.get('minprice') ? Number(searchParams.get('minprice')) : undefined,
    maxPrice: searchParams.get('maxprice') ? Number(searchParams.get('maxprice')) : undefined,
    onSale: searchParams.get('onsale') === '1' || undefined,
  }

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts(filters)
  const { data: brands = [] } = useBrands()
  const { data: types = [] } = useProductTypes()
  const deleteProduct = useDeleteProduct()
  const deleteProducts = useDeleteProducts()
  const confirm = useConfirm()

  const allProducts = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const count = data?.pages[0]?.count ?? 0

  const allIds = useMemo(() => allProducts.map((p) => p.id), [allProducts])
  const selection = useSelection(allIds)

  // Infinite scroll — fetch the next page when the sentinel comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleFiltersChange = useCallback(
    (newFilters: ProductFilters) => {
      const params = new URLSearchParams()
      if (newFilters.types?.length) params.set('types', newFilters.types.join(','))
      if (newFilters.brands?.length) params.set('brands', newFilters.brands.join(','))
      if (newFilters.colors?.length) params.set('colors', newFilters.colors.join(','))
      if (newFilters.materials?.length) params.set('materials', newFilters.materials.join(','))
      if (newFilters.sizes?.length) params.set('sizes', newFilters.sizes.join(','))
      if (newFilters.shoeSizes?.length) params.set('shoesizes', newFilters.shoeSizes.join(','))
      if (newFilters.minPrice) params.set('minprice', String(newFilters.minPrice))
      if (newFilters.maxPrice) params.set('maxprice', String(newFilters.maxPrice))
      if (newFilters.onSale) params.set('onsale', '1')
      setSearchParams(params)
    },
    [setSearchParams]
  )

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer le produit',
      message: 'Ce produit sera définitivement supprimé. Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteProduct.mutateAsync(id)
      success('Produit supprimé')
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la suppression'))
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selection.count === 0) return
    const n = selection.count
    const ok = await confirm({
      title: `Supprimer ${n} produit${n > 1 ? 's' : ''}`,
      message: `Les ${n} produits sélectionnés seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteProducts.mutateAsync(selection.ids)
      success(`${n} produit${n > 1 ? 's' : ''} supprimé${n > 1 ? 's' : ''}`)
      selection.clear()
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la suppression'))
    }
  }, [selection, confirm, deleteProducts, success, showError])

  // Keyboard shortcuts: Esc clears, Ctrl/Cmd+A selects all, Del/Backspace deletes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape') {
        selection.clear()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && !typing) {
        if (allIds.length) {
          e.preventDefault()
          selection.selectAll()
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selection.count > 0) {
        e.preventDefault()
        handleBulkDelete()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection, allIds, handleBulkDelete])

  return (
    <div className="min-h-screen">
      <Toolbar title="Produits">
        <Button variant="ghost" onClick={() => setFiltersOpen(!filtersOpen)}>
          <FunnelIcon className="mr-2 h-5 w-5" />
          Filtres
        </Button>
        <Button onClick={() => navigate('/products/edit')}>
          <PlusIcon className="mr-2 h-5 w-5" />
          Ajouter
        </Button>
      </Toolbar>

      <div className="p-6">
        {/* Stats */}
        <p className="mb-4 text-sm text-gray-500">
          {count} produit{count > 1 ? 's' : ''}
        </p>

        {isLoading && allProducts.length === 0 ? (
          <CardGridSkeleton count={10} />
        ) : isError && allProducts.length === 0 ? (
          <EmptyState
            icon={ExclamationTriangleIcon}
            title="Impossible de charger les produits"
            description={getErrorMessage(error)}
            action={<Button onClick={() => refetch()}>Réessayer</Button>}
          />
        ) : allProducts.length === 0 ? (
          <EmptyState
            icon={ShoppingBagIcon}
            title="Aucun produit"
            description="Aucun produit ne correspond à vos filtres. Ajustez-les ou ajoutez un nouveau produit."
            action={
              <Button onClick={() => navigate('/products/edit')}>
                <PlusIcon className="mr-2 h-5 w-5" />
                Ajouter un produit
              </Button>
            }
          />
        ) : (
          <>
            {/* Products grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                  selectable
                  selected={selection.isSelected(product.id)}
                  onToggleSelect={selection.toggle}
                />
              ))}
            </div>

            {/* Infinite-scroll sentinel */}
            <div ref={loaderRef} className="mt-6 h-10">
              {isFetchingNextPage && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SelectionBar
        noun="produit"
        count={selection.count}
        total={count}
        allSelected={selection.allSelected}
        onSelectAll={selection.selectAll}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
        busy={deleteProducts.isPending}
      />

      <ProductFiltersDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTypes={types}
        availableBrands={brands}
        availableColors={[...COLORS]}
        availableMaterials={[...MATERIALS]}
      />
    </div>
  )
}
