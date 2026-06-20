import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useGlobalShortcuts } from './useGlobalShortcuts'

function setup() {
  const onNavigate = vi.fn()
  const onToggleHelp = vi.fn()
  renderHook(() => useGlobalShortcuts({ onNavigate, onToggleHelp }))
  return { onNavigate, onToggleHelp }
}

describe('useGlobalShortcuts', () => {
  let input: HTMLInputElement

  beforeEach(() => {
    input = document.createElement('input')
    document.body.appendChild(input)
  })
  afterEach(() => {
    input.remove()
  })

  it('navigates with "g" then a target key', () => {
    const { onNavigate } = setup()
    fireEvent.keyDown(document.body, { key: 'g' })
    fireEvent.keyDown(document.body, { key: 'p' })
    expect(onNavigate).toHaveBeenCalledWith('/products')
  })

  it('maps every goto target', () => {
    const { onNavigate } = setup()
    for (const [key, path] of [
      ['d', '/'],
      ['l', '/looks'],
      ['u', '/users'],
    ] as const) {
      fireEvent.keyDown(document.body, { key: 'g' })
      fireEvent.keyDown(document.body, { key })
      expect(onNavigate).toHaveBeenCalledWith(path)
    }
  })

  it('toggles help on "?"', () => {
    const { onToggleHelp } = setup()
    fireEvent.keyDown(document.body, { key: '?' })
    expect(onToggleHelp).toHaveBeenCalledOnce()
  })

  it('ignores shortcuts while typing in a field', () => {
    const { onNavigate } = setup()
    fireEvent.keyDown(input, { key: 'g' })
    fireEvent.keyDown(input, { key: 'p' })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('ignores a lone "g" followed by an unknown key', () => {
    const { onNavigate } = setup()
    fireEvent.keyDown(document.body, { key: 'g' })
    fireEvent.keyDown(document.body, { key: 'x' })
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('does not fire when a modifier is held', () => {
    const { onNavigate, onToggleHelp } = setup()
    fireEvent.keyDown(document.body, { key: 'g', ctrlKey: true })
    fireEvent.keyDown(document.body, { key: 'p', ctrlKey: true })
    expect(onNavigate).not.toHaveBeenCalled()
    expect(onToggleHelp).not.toHaveBeenCalled()
  })
})
