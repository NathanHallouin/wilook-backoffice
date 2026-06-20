import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from './Button'

interface SelectionBarProps {
  count: number
  total: number
  allSelected: boolean
  onSelectAll: () => void
  onClear: () => void
  onDelete: () => void
  busy?: boolean
  /** Singular noun, e.g. "produit" / "look". */
  noun: string
}

/**
 * Floating action bar for bulk operations. Renders only when at least one item
 * is selected.
 */
export function SelectionBar({
  count,
  total,
  allSelected,
  onSelectAll,
  onClear,
  onDelete,
  busy = false,
  noun,
}: SelectionBarProps) {
  if (count === 0) return null

  return (
    <div className="animate-fade-in fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="shadow-pop flex items-center gap-3 rounded-2xl border border-gray-200 bg-surface px-3 py-2">
        <button
          onClick={onClear}
          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Annuler la sélection"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium text-gray-900">
          {count} {noun}
          {count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}
        </span>

        {!allSelected && total > count && (
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            Tout sélectionner ({total})
          </Button>
        )}

        <Button variant="danger" size="sm" onClick={onDelete} loading={busy}>
          <TrashIcon className="mr-1.5 h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
