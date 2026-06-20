import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Toolbar } from '@/components/layout'
import { Button, useConfirm } from '@/components/ui'
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
  const confirm = useConfirm()

  const handleDeleteLook = async (id: string) => {
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
    } catch {
      showError('Erreur lors de la suppression')
    }
  }

  const isLoading = loadingCustomer || loadingLooks

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full" />
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                {(
                  (customer.first_name?.[0] ?? '') + (customer.last_name?.[0] ?? '')
                ).toUpperCase() || customer.email[0].toUpperCase()}
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {[customer.first_name, customer.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Nom non renseigné'}
                </h1>
                <p className="mt-0.5 text-gray-500">{customer.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="font-medium text-gray-900">
                {new Date(customer.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Questionnaire */}
        <Questionnaire customer={customer} />

        {/* Looks */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-card p-6">
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
