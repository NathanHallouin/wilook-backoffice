import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { LookCard } from '@/components/looks'
import { useLooks, useDeleteLook } from '@/hooks'
import { useSnackbarStore } from '@/stores'
import { cn } from '@/utils/cn'
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
  const { data, isLoading } = useLooks(activeTab)
  const deleteLook = useDeleteLook()

  const handleDelete = async (id: string) => {
    try {
      await deleteLook.mutateAsync(id)
      success('Look supprimé')
    } catch {
      showError('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen">
      <Toolbar title="Looks">
        <Button onClick={() => navigate('/looks/edit')}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Créer un look
        </Button>
      </Toolbar>

      <div className="p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.value
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {data?.count ?? 0} look{(data?.count ?? 0) > 1 ? 's' : ''}
        </p>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data?.data.map((look) => (
              <LookCard key={look.id} look={look} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun look trouvé</p>
            <Button className="mt-4" onClick={() => navigate('/looks/edit')}>
              Créer un look
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
