import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'

describe('useSelection', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useSelection(['a', 'b', 'c']))
    expect(result.current.count).toBe(0)
    expect(result.current.allSelected).toBe(false)
    expect(result.current.ids).toEqual([])
  })

  it('toggles an id on and off', () => {
    const { result } = renderHook(() => useSelection(['a', 'b', 'c']))
    act(() => result.current.toggle('a'))
    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.count).toBe(1)
    act(() => result.current.toggle('a'))
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.count).toBe(0)
  })

  it('selectAll selects every loaded id and sets allSelected', () => {
    const { result } = renderHook(() => useSelection(['a', 'b']))
    act(() => result.current.selectAll())
    expect(result.current.count).toBe(2)
    expect(result.current.allSelected).toBe(true)
    expect([...result.current.ids].sort()).toEqual(['a', 'b'])
  })

  it('clear empties the selection', () => {
    const { result } = renderHook(() => useSelection(['a', 'b']))
    act(() => result.current.toggle('a'))
    act(() => result.current.clear())
    expect(result.current.count).toBe(0)
  })

  it('allSelected stays false when an id is missing', () => {
    const { result } = renderHook(() => useSelection(['a', 'b']))
    act(() => result.current.toggle('a'))
    expect(result.current.allSelected).toBe(false)
  })
})
