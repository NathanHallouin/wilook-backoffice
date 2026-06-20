import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { SnackbarContainer, DevBanner } from '@/components/ui'

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  )
}

export function Layout() {
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
    </div>
  )
}
