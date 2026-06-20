import { IMAGE_CONFIG } from '@/config/constants'

/**
 * Downscale an image to IMAGE_CONFIG.MAX_HEIGHT and re-encode it as WebP before
 * upload. Keeps aspect ratio, never upscales. Falls back to the original file
 * if the browser can't process it (or the input isn't a raster image).
 */
export async function processImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, IMAGE_CONFIG.MAX_HEIGHT / bitmap.height)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', IMAGE_CONFIG.WEBP_QUALITY)
    )
    if (!blob) return file

    // Never ship a bigger file than the original.
    if (blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch {
    return file
  }
}
