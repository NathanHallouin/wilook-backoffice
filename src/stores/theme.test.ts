import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './theme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  useThemeStore.getState().setTheme('light')
})

describe('useThemeStore', () => {
  it('applies the dark class and persists the choice', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().resolvedDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('removes the dark class for the light theme', () => {
    useThemeStore.getState().setTheme('dark')
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().resolvedDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggle flips between light and dark', () => {
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().resolvedDark).toBe(true)
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().resolvedDark).toBe(false)
  })
})
