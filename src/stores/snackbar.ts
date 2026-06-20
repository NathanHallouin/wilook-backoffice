import { create } from 'zustand'
import type { SnackbarMessage } from '@/types'

interface SnackbarState {
  messages: SnackbarMessage[]
  addMessage: (message: Omit<SnackbarMessage, 'id'>) => void
  removeMessage: (id: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

export const useSnackbarStore = create<SnackbarState>((set, get) => ({
  messages: [],

  addMessage: (message) => {
    const id = crypto.randomUUID()
    // Keep at most the 4 most recent toasts.
    set((state) => ({
      messages: [...state.messages, { ...message, id }].slice(-4),
    }))

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeMessage(id)
    }, 5000)
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    }))
  },

  success: (message) => get().addMessage({ type: 'success', message }),
  error: (message) => get().addMessage({ type: 'error', message }),
  info: (message) => get().addMessage({ type: 'info', message }),
  warning: (message) => get().addMessage({ type: 'warning', message }),
}))
