import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout'
import {
  DashboardPage,
  ProductsPage,
  ProductEditPage,
  LooksPage,
  LookEditPage,
  UsersPage,
  UserProfilePage,
} from '@/pages'

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
    </QueryClientProvider>
  )
}

export default App
