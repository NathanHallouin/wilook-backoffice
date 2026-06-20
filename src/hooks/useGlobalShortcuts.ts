import { useEffect, useRef } from 'react'

interface GlobalShortcutsOptions {
  onNavigate: (path: string) => void
  onToggleHelp: () => void
}

/** Gmail-style "g then <key>" navigation targets. */
export const GOTO_TARGETS: Record<string, string> = {
  d: '/',
  p: '/products',
  l: '/looks',
  u: '/users',
}

const isTyping = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/**
 * Global keyboard shortcuts for the desktop backoffice:
 *   g d / g p / g l / g u  → navigate (Dashboard / Produits / Looks / Users)
 *   ?                      → toggle the shortcuts help
 * Ignored while typing in a field or when a modifier (Ctrl/Cmd/Alt) is held.
 */
export function useGlobalShortcuts({ onNavigate, onToggleHelp }: GlobalShortcutsOptions) {
  const pendingGoto = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearPending = () => {
      pendingGoto.current = false
      if (timer.current) clearTimeout(timer.current)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e.target)) return

      if (e.key === '?') {
        e.preventDefault()
        onToggleHelp()
        return
      }

      if (pendingGoto.current) {
        const dest = GOTO_TARGETS[e.key.toLowerCase()]
        clearPending()
        if (dest) {
          e.preventDefault()
          onNavigate(dest)
        }
        return
      }

      if (e.key.toLowerCase() === 'g') {
        pendingGoto.current = true
        timer.current = setTimeout(() => {
          pendingGoto.current = false
        }, 1500)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [onNavigate, onToggleHelp])
}
