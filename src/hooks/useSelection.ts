import { useState, useCallback, useMemo } from 'react'

/**
 * Multi-selection state for list/grid pages (bulk actions).
 *
 * `allIds` is the currently-loaded set (grows with infinite scroll); `selectAll`
 * and `allSelected` are computed against it. Selected ids that scroll out or get
 * deleted simply stay in the set until cleared — harmless for bulk operations.
 */
export function useSelection<T extends string>(allIds: T[]) {
  const [selected, setSelected] = useState<Set<T>>(new Set())

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  const selectAll = useCallback(() => setSelected(new Set(allIds)), [allIds])

  const isSelected = useCallback((id: T) => selected.has(id), [selected])

  const allSelected = useMemo(
    () => allIds.length > 0 && allIds.every((id) => selected.has(id)),
    [allIds, selected]
  )

  const ids = useMemo(() => Array.from(selected), [selected])

  return { selected, ids, count: selected.size, allSelected, toggle, clear, selectAll, isSelected }
}
