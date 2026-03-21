import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { SnackbarContainer, DevBanner } from '@/components/ui'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DevBanner />
      <Navbar />
      <main className="ml-16">
        <Outlet />
      </main>
      <SnackbarContainer />
    </div>
  )
}
