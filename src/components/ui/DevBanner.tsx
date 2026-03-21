import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { isSupabaseConfigured, isDev } from '@/services/supabase'

export function DevBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Only show in dev mode when Supabase is not configured
  if (!isDev || isSupabaseConfigured || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-500 text-amber-950">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              <span className="font-bold">Mode démo</span> — Supabase non configuré. Les données sont stockées localement (localStorage).
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-600 rounded transition-colors"
            title="Fermer"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
