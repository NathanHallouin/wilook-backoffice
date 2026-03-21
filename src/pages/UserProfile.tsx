import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button } from '@/components/ui'
import { Questionnaire } from '@/components/customers'
import { LookCard } from '@/components/looks'
import { useCustomer, useCustomerLooks, useDeleteLook } from '@/hooks'
import { useSnackbarStore } from '@/stores'

export function UserProfilePage() {
  const { email } = useParams<{ email: string }>()
  const navigate = useNavigate()
  const decodedEmail = email ? decodeURIComponent(email) : ''

  const { success, error: showError } = useSnackbarStore()
  const { data: customer, isLoading: loadingCustomer } = useCustomer(decodedEmail)
  const { data: looks = [], isLoading: loadingLooks } = useCustomerLooks(decodedEmail)
  const deleteLook = useDeleteLook()

  const handleDeleteLook = async (id: string) => {
    try {
      await deleteLook.mutateAsync(id)
      success('Look supprimé')
    } catch {
      showError('Erreur lors de la suppression')
    }
  }

  const isLoading = loadingCustomer || loadingLooks

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen">
        <Toolbar title="Utilisateur non trouvé">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </Button>
        </Toolbar>
        <div className="p-6 text-center text-gray-500">
          L'utilisateur demandé n'existe pas.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toolbar title={decodedEmail}>
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </Button>
      </Toolbar>

      <div className="p-6 space-y-6">
        {/* Customer info header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {[customer.first_name, customer.last_name].filter(Boolean).join(' ') ||
                  'Nom non renseigné'}
              </h1>
              <p className="text-gray-500 mt-1">{customer.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="text-gray-900">
                {new Date(customer.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Questionnaire */}
        <Questionnaire customer={customer} />

        {/* Looks */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Looks ({looks.length})
          </h2>

          {looks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun look assigné à ce client
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {looks.map((look) => (
                <LookCard key={look.id} look={look} onDelete={handleDeleteLook} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
