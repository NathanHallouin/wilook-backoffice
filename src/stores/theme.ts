import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

const prefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

/** Whether a theme choice resolves to the dark palette right now. */
export const isDark = (theme: Theme): boolean =>
  theme === 'dark' || (theme === 'system' && prefersDark())

/** Toggle the `dark` class on <html> to match the resolved theme. */
function apply(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', isDark(theme))
}

function readStored(): Theme {
  if (typeof localStorage === 'undefined') return 'system'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
}

interface ThemeState {
  theme: Theme
  resolvedDark: boolean
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStored(),
  resolvedDark: isDark(readStored()),

  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme)
    apply(theme)
    set({ theme, resolvedDark: isDark(theme) })
  },

  // Flip between explicit light/dark based on what's currently shown.
  toggle: () => {
    get().setTheme(get().resolvedDark ? 'light' : 'dark')
  },
}))

// Apply the persisted choice immediately (before first paint of the app tree).
apply(useThemeStore.getState().theme)

// Keep "system" in sync with OS changes.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') setTheme('system')
  })
}
