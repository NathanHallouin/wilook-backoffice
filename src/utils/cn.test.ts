import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    const hidden = false
    expect(cn('a', hidden && 'b', undefined, null, 'c')).toBe('a c')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-gray-500', 'text-brand-600')).toBe('text-brand-600')
  })
})
