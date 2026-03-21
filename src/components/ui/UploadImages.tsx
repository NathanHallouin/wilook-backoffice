import { useCallback, useState } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'
import { IMAGE_CONFIG } from '@/config/constants'

interface UploadImagesProps {
  images: string[]
  onUpload: (files: File[]) => void
  onRemove: (index: number) => void
  maxFiles?: number
}

export function UploadImages({
  images,
  onUpload,
  onRemove,
  maxFiles = 5,
}: UploadImagesProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter((file) => {
        if (!file.type.startsWith('image/')) return false
        if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) return false
        return true
      })

      if (files.length > 0) {
        onUpload(files.slice(0, maxFiles - images.length))
      }
    },
    [images.length, maxFiles, onUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onUpload(files.slice(0, maxFiles - images.length))
      }
      e.target.value = ''
    },
    [images.length, maxFiles, onUpload]
  )

  return (
    <div className="space-y-4">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Glissez-déposez des images ici, ou{' '}
            <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
              parcourez
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WebP jusqu'à {IMAGE_CONFIG.MAX_FILE_SIZE_MB}MB
          </p>
        </div>
      )}
    </div>
  )
}
