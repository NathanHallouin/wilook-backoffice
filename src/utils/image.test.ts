import { describe, it, expect } from 'vitest'
import { processImage } from './image'

describe('processImage', () => {
  it('passes non-image files through unchanged', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    expect(await processImage(file)).toBe(file)
  })

  it('falls back to the original file when processing is unavailable', async () => {
    // jsdom has no real canvas/createImageBitmap, so the WebP path throws and
    // the helper must return the input untouched rather than reject.
    const file = new File([new Uint8Array([1, 2, 3])], 'pic.png', {
      type: 'image/png',
    })
    expect(await processImage(file)).toBe(file)
  })
})
