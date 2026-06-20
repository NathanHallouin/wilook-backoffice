import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ConfirmProvider } from '@/components/ui'
import { AuthProvider, RequireAuth } from '@/components/auth/AuthProvider'
import { LoginPage } from '@/pages/Login'

// Lazy-loaded routes — each page ships in its own chunk.
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage }))
)
const ProductsPage = lazy(() =>
  import('@/pages/Products').then((m) => ({ default: m.ProductsPage }))
)
const ProductEditPage = lazy(() =>
  import('@/pages/ProductEdit').then((m) => ({ default: m.ProductEditPage }))
)
const LooksPage = lazy(() =>
  import('@/pages/Looks').then((m) => ({ default: m.LooksPage }))
)
const LookEditPage = lazy(() =>
  import('@/pages/LookEdit').then((m) => ({ default: m.LookEditPage }))
)
const UsersPage = lazy(() =>
  import('@/pages/Users').then((m) => ({ default: m.UsersPage }))
)
const UserProfilePage = lazy(() =>
  import('@/pages/UserProfile').then((m) => ({ default: m.UserProfilePage }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <RequireAuth>
                      <Layout />
                    </RequireAuth>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/edit" element={<ProductEditPage />} />
                  <Route path="/looks" element={<LooksPage />} />
                  <Route path="/looks/edit" element={<LookEditPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/user/:email" element={<UserProfilePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ConfirmProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
