import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Toolbar } from '@/components/layout'
import { Button, Input, Textarea, Select, Combobox, UploadImages } from '@/components/ui'
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useBrands,
  useProviders,
  useUploadProductImage,
} from '@/hooks'
import { useSnackbarStore } from '@/stores'
import { getErrorMessage } from '@/utils/error'
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CONDITION_LABELS } from '@/config/constants'
import {
  COLORS,
  MATERIALS,
  DETAILS,
  CLOTHING_SIZES,
  SHOE_SIZES,
  typesForCategory,
} from '@/config/formValues'
import type { Product, ProductCategory, ProductCondition } from '@/types'

const categoryOptions = Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const conditionOptions = Object.entries(PRODUCT_CONDITION_LABELS).map(([value, label]) => ({
  value,
  label,
}))

type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>

const initialFormData: ProductFormData = {
  title: '',
  description: null,
  category: 'top',
  type: '',
  condition: 'new',
  brand: null,
  provider: null,
  colors: [],
  materials: [],
  details: [],
  sizes: [],
  shoe_sizes: [],
  price: 0,
  final_price: null,
  images: [],
  thumbnail: null,
}

export function ProductEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('id')
  const isEditing = !!productId

  const { success, error: showError } = useSnackbarStore()
  const { data: existingProduct, isLoading } = useProduct(productId ?? undefined)
  const { data: brands = [] } = useBrands()
  const { data: providers = [] } = useProviders()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const uploadImage = useUploadProductImage()

  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Hydrate the form from the loaded product (and when switching products).
  // Guarded render-time state adjustment — see https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  if (existingProduct && hydratedId !== existingProduct.id) {
    setHydratedId(existingProduct.id)
    setFormData({
      title: existingProduct.title,
      description: existingProduct.description,
      category: existingProduct.category,
      type: existingProduct.type,
      condition: existingProduct.condition,
      brand: existingProduct.brand,
      provider: existingProduct.provider,
      colors: existingProduct.colors,
      materials: existingProduct.materials,
      details: existingProduct.details,
      sizes: existingProduct.sizes,
      shoe_sizes: existingProduct.shoe_sizes,
      price: existingProduct.price,
      final_price: existingProduct.final_price,
      images: existingProduct.images,
      thumbnail: existingProduct.thumbnail,
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!formData.title.trim()) next.title = 'Le titre est requis'
    if (!formData.type.trim()) next.type = 'Le type est requis'
    if (!(formData.price > 0)) next.price = 'Le prix doit être supérieur à 0'
    if (formData.final_price != null && formData.final_price >= formData.price)
      next.final_price = 'Le prix promo doit être inférieur au prix'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      let product: Product

      if (isEditing && productId) {
        product = await updateProduct.mutateAsync({
          id: productId,
          updates: formData,
        })
      } else {
        product = await createProduct.mutateAsync(formData)
      }

      // Upload pending images
      if (pendingFiles.length > 0) {
        const uploadedUrls: string[] = []
        for (const file of pendingFiles) {
          const url = await uploadImage.mutateAsync({ productId: product.id, file })
          uploadedUrls.push(url)
        }

        // Update product with new images
        await updateProduct.mutateAsync({
          id: product.id,
          updates: {
            images: [...formData.images, ...uploadedUrls],
            thumbnail: formData.thumbnail || uploadedUrls[0],
          },
        })
      }

      success(isEditing ? 'Produit mis à jour' : 'Produit créé')
      navigate('/products')
    } catch (err) {
      showError(getErrorMessage(err))
    }
  }

  const handleImageUpload = (files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files])
    // Create preview URLs
    const previewUrls = files.map((f) => URL.createObjectURL(f))
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...previewUrls],
    }))
  }

  const handleImageRemove = (index: number) => {
    const imageToRemove = formData.images[index]
    // If it's a blob URL (pending file), remove from pendingFiles too
    if (imageToRemove.startsWith('blob:')) {
      const pendingIndex = formData.images
        .slice(0, index + 1)
        .filter((img) => img.startsWith('blob:')).length - 1
      setPendingFiles((prev) => prev.filter((_, i) => i !== pendingIndex))
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
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
      <Toolbar title={isEditing ? 'Modifier le produit' : 'Nouveau produit'}>
        <Button variant="ghost" onClick={() => navigate('/products')}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          loading={createProduct.isPending || updateProduct.isPending}
        >
          Enregistrer
        </Button>
      </Toolbar>

      <form onSubmit={handleSubmit} className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Basic info */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Informations générales</h2>

            <Input
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              error={errors.title}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Catégorie"
                options={categoryOptions}
                value={formData.category}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as ProductCategory }))
                }
              />
              <div>
                <Combobox
                  label="Type"
                  options={[...typesForCategory(formData.category)]}
                  selected={formData.type ? [formData.type] : []}
                  onChange={(selected) =>
                    setFormData((prev) => ({ ...prev, type: selected[0] ?? '' }))
                  }
                  placeholder="Sélectionner un type..."
                  allowCreate
                  multiple={false}
                />
                {errors.type && (
                  <p className="mt-1 text-xs text-red-600">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="État"
                options={conditionOptions}
                value={formData.condition}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, condition: value as ProductCondition }))
                }
              />
              <Combobox
                label="Marque"
                options={brands}
                selected={formData.brand ? [formData.brand] : []}
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, brand: selected[0] || null }))
                }
                allowCreate
                multiple={false}
              />
            </div>

            <Combobox
              label="Fournisseur"
              options={providers}
              selected={formData.provider ? [formData.provider] : []}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, provider: selected[0] || null }))
              }
              allowCreate
              multiple={false}
            />

            <Textarea
              label="Description"
              value={formData.description ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value || null,
                }))
              }
              placeholder="Description du produit..."
            />
          </div>

          {/* Attributes */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Attributs</h2>

            <Combobox
              label="Couleurs"
              options={[...COLORS]}
              selected={formData.colors}
              onChange={(colors) => setFormData((prev) => ({ ...prev, colors }))}
              allowCreate
            />

            <Combobox
              label="Matières"
              options={[...MATERIALS]}
              selected={formData.materials}
              onChange={(materials) => setFormData((prev) => ({ ...prev, materials }))}
              allowCreate
            />

            <Combobox
              label="Détails"
              options={[...DETAILS]}
              selected={formData.details}
              onChange={(details) => setFormData((prev) => ({ ...prev, details }))}
              allowCreate
            />

            {formData.category === 'shoes' ? (
              <Combobox
                label="Pointures"
                options={[...SHOE_SIZES]}
                selected={formData.shoe_sizes}
                onChange={(shoe_sizes) => setFormData((prev) => ({ ...prev, shoe_sizes }))}
                allowCreate
              />
            ) : (
              <Combobox
                label="Tailles"
                options={[...CLOTHING_SIZES]}
                selected={formData.sizes}
                onChange={(sizes) => setFormData((prev) => ({ ...prev, sizes }))}
                allowCreate
              />
            )}
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Prix</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prix"
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                }
                error={errors.price}
              />
              <Input
                label="Prix final (promo)"
                type="number"
                min={0}
                step={0.01}
                value={formData.final_price ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    final_price: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                error={errors.final_price}
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Images</h2>
            <UploadImages
              images={formData.images}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
