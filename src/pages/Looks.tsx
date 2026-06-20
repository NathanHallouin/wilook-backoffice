import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button, CardGridSkeleton, EmptyState, useConfirm } from '@/components/ui'
import { LookCard } from '@/components/looks'
import { useInfiniteLooks, useDeleteLook } from '@/hooks'
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
  const confirm = useConfirm()

  const loaderRef = useRef<HTMLDivElement>(null)
  const allLooks = data?.pages.flatMap((p) => p.data) ?? []
  const count = data?.pages[0]?.count ?? 0

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
                <LookCard key={look.id} look={look} onDelete={handleDelete} />
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
    </div>
  )
}
