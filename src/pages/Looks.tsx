import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button, CardGridSkeleton, EmptyState, SelectionBar, useConfirm } from '@/components/ui'
import { LookCard } from '@/components/looks'
import { useInfiniteLooks, useDeleteLook, useDeleteLooks, useSelection } from '@/hooks'
import { useSnackbarStore } from '@/stores'
import { cn } from '@/utils/cn'
import { getErrorMessage } from '@/utils/error'
import type { LookFilter } from '@/services/looks'

const tabs: { value: LookFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'public', label: 'Publics' },
  { value: 'unused', label: 'Non assignés' },
]

export function LooksPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useSnackbarStore()

  const [activeTab, setActiveTab] = useState<LookFilter>('all')
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteLooks(activeTab)
  const deleteLook = useDeleteLook()
  const deleteLooks = useDeleteLooks()
  const confirm = useConfirm()

  const loaderRef = useRef<HTMLDivElement>(null)
  const allLooks = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const count = data?.pages[0]?.count ?? 0

  const allIds = useMemo(() => allLooks.map((l) => l.id), [allLooks])
  const selection = useSelection(allIds)

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer le look',
      message: 'Ce look sera définitivement supprimé. Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteLook.mutateAsync(id)
      success('Look supprimé')
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la suppression'))
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selection.count === 0) return
    const n = selection.count
    const ok = await confirm({
      title: `Supprimer ${n} look${n > 1 ? 's' : ''}`,
      message: `Les ${n} looks sélectionnés seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteLooks.mutateAsync(selection.ids)
      success(`${n} look${n > 1 ? 's' : ''} supprimé${n > 1 ? 's' : ''}`)
      selection.clear()
    } catch (err) {
      showError(getErrorMessage(err, 'Erreur lors de la suppression'))
    }
  }, [selection, confirm, deleteLooks, success, showError])

  // Clear the selection when switching tabs (the visible set changes).
  const clearSelection = selection.clear
  useEffect(() => {
    clearSelection()
  }, [activeTab, clearSelection])

  // Keyboard shortcuts: Esc clears, Ctrl/Cmd+A selects all, Del/Backspace deletes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape') {
        selection.clear()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && !typing) {
        if (allIds.length) {
          e.preventDefault()
          selection.selectAll()
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selection.count > 0) {
        e.preventDefault()
        handleBulkDelete()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection, allIds, handleBulkDelete])

  return (
    <div className="min-h-screen">
      <Toolbar title="Looks">
        <Button onClick={() => navigate('/looks/edit')}>
          <PlusIcon className="mr-2 h-5 w-5" />
          Créer un look
        </Button>
      </Toolbar>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6 inline-flex gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <p className="mb-4 text-sm text-gray-500">
          {count} look{count > 1 ? 's' : ''}
        </p>

        {isLoading && allLooks.length === 0 ? (
          <CardGridSkeleton count={10} />
        ) : isError && allLooks.length === 0 ? (
          <EmptyState
            icon={ExclamationTriangleIcon}
            title="Impossible de charger les looks"
            description={getErrorMessage(error)}
            action={<Button onClick={() => refetch()}>Réessayer</Button>}
          />
        ) : allLooks.length === 0 ? (
          <EmptyState
            icon={SparklesIcon}
            title="Aucun look"
            description="Commencez par composer un look à partir de vos produits."
            action={
              <Button onClick={() => navigate('/looks/edit')}>
                <PlusIcon className="mr-2 h-5 w-5" />
                Créer un look
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allLooks.map((look) => (
                <LookCard
                  key={look.id}
                  look={look}
                  onDelete={handleDelete}
                  selectable
                  selected={selection.isSelected(look.id)}
                  onToggleSelect={selection.toggle}
                />
              ))}
            </div>

            {/* Infinite-scroll sentinel */}
            <div ref={loaderRef} className="mt-6 h-10">
              {isFetchingNextPage && (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SelectionBar
        noun="look"
        count={selection.count}
        total={count}
        allSelected={selection.allSelected}
        onSelectAll={selection.selectAll}
        onClear={selection.clear}
        onDelete={handleBulkDelete}
        busy={deleteLooks.isPending}
      />
    </div>
  )
}
