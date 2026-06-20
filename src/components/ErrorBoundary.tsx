import { Component, type ReactNode } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render-time errors so a single failing view never blanks the app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Replace with a real reporter (Sentry…) once available.
    console.error('Unhandled UI error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Une erreur est survenue
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              L'application a rencontré un problème inattendu. Vous pouvez
              recharger la page pour reprendre.
            </p>
            <div className="mt-6">
              <Button onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
