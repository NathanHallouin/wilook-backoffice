import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { ProductCard, ProductFiltersDrawer } from '@/components/products'
import { useProducts, useBrands, useProductTypes, useDeleteProduct } from '@/hooks'
import { useSnackbarStore, useInterfaceStore } from '@/stores'
import type { Product, ProductFilters } from '@/types'

const COMMON_COLORS = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Gris', 'Beige', 'Marron']
const COMMON_MATERIALS = ['Coton', 'Laine', 'Soie', 'Lin', 'Polyester', 'Cuir', 'Denim']

export function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { filtersOpen, setFiltersOpen } = useInterfaceStore()
  const { success, error: showError } = useSnackbarStore()

  const [page, setPage] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const loaderRef = useRef<HTMLDivElement>(null)

  // Parse filters from URL
  const filters: ProductFilters = {
    types: searchParams.get('types')?.split(',').filter(Boolean),
    brands: searchParams.get('brands')?.split(',').filter(Boolean),
    colors: searchParams.get('colors')?.split(',').filter(Boolean),
    materials: searchParams.get('materials')?.split(',').filter(Boolean),
    minPrice: searchParams.get('minprice') ? Number(searchParams.get('minprice')) : undefined,
    maxPrice: searchParams.get('maxprice') ? Number(searchParams.get('maxprice')) : undefined,
  }

  const { data, isLoading } = useProducts(filters, { page })
  const { data: brands = [] } = useBrands()
  const { data: types = [] } = useProductTypes()
  const deleteProduct = useDeleteProduct()

  // Accumulate products for infinite scroll
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllProducts(data.data)
      } else {
        setAllProducts((prev) => [...prev, ...data.data])
      }
    }
  }, [data, page])

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    setAllProducts([])
  }, [searchParams])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && data && allProducts.length < data.count) {
          setPage((p) => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, data, allProducts.length])

  const handleFiltersChange = useCallback(
    (newFilters: ProductFilters) => {
      const params = new URLSearchParams()
      if (newFilters.types?.length) params.set('types', newFilters.types.join(','))
      if (newFilters.brands?.length) params.set('brands', newFilters.brands.join(','))
      if (newFilters.colors?.length) params.set('colors', newFilters.colors.join(','))
      if (newFilters.materials?.length) params.set('materials', newFilters.materials.join(','))
      if (newFilters.minPrice) params.set('minprice', String(newFilters.minPrice))
      if (newFilters.maxPrice) params.set('maxprice', String(newFilters.maxPrice))
      setSearchParams(params)
    },
    [setSearchParams]
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id)
      setAllProducts((prev) => prev.filter((p) => p.id !== id))
      success('Produit supprimé')
    } catch {
      showError('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Produits">
        <Button
          variant="ghost"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filtres
        </Button>
        <Button onClick={() => navigate('/products/edit')}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter
        </Button>
      </Toolbar>

      <div className="p-6">
        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {data?.count ?? 0} produit{(data?.count ?? 0) > 1 ? 's' : ''}
        </p>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {allProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Loader */}
        <div ref={loaderRef} className="h-10 mt-4">
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      <ProductFiltersDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTypes={types}
        availableBrands={brands}
        availableColors={COMMON_COLORS}
        availableMaterials={COMMON_MATERIALS}
      />
    </div>
  )
}
