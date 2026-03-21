import { create } from 'zustand'

interface InterfaceState {
  filtersOpen: boolean
  toggleFilters: () => void
  setFiltersOpen: (open: boolean) => void
}

export const useInterfaceStore = create<InterfaceState>((set) => ({
  filtersOpen: false,
  toggleFilters: () => set((state) => ({ filtersOpen: !state.filtersOpen })),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
}))
