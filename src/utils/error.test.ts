import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './error'

describe('getErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(getErrorMessage(new Error('Failed to delete product: FK constraint'))).toBe(
      'Failed to delete product: FK constraint'
    )
  })

  it('returns a non-empty string as-is', () => {
    expect(getErrorMessage('boom')).toBe('boom')
  })

  it('falls back when the value has no usable message', () => {
    expect(getErrorMessage(null)).toBe('Une erreur est survenue')
    expect(getErrorMessage(new Error('   '))).toBe('Une erreur est survenue')
    expect(getErrorMessage({ code: 500 })).toBe('Une erreur est survenue')
  })

  it('uses the provided fallback', () => {
    expect(getErrorMessage(undefined, 'Erreur lors de la suppression')).toBe(
      'Erreur lors de la suppression'
    )
  })
})
