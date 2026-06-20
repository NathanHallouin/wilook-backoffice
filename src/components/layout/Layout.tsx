import { Suspense, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ShortcutsHelp } from './ShortcutsHelp'
import { SnackbarContainer, DevBanner } from '@/components/ui'
import { useGlobalShortcuts } from '@/hooks'

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

export function Layout() {
  const navigate = useNavigate()
  const [helpOpen, setHelpOpen] = useState(false)

  useGlobalShortcuts({
    onNavigate: (path) => navigate(path),
    onToggleHelp: () => setHelpOpen((v) => !v),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="ml-60">
        <DevBanner />
        <main className="animate-fade-in">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <SnackbarContainer />
      <ShortcutsHelp isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
