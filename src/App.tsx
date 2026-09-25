import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import TodoApp from './pages/TodoApp'
import UserDetail from './pages/UserDetail'
import UserDirectory from './pages/UserDirectory'
import CartPage from './pages/CartPage'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import UpdateToast from './components/UpdateToast'
import './App.css'

const HabitTracker = lazy(() => import('./pages/HabitTracker'))

export default function App() {
  return (
    <div className="app-shell">
      <ErrorBoundary fallback={<p>Navigation is temporarily unavailable.</p>}>
        <NavBar />
      </ErrorBoundary>
      <OfflineBanner />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/habits"
              element={(
                <ErrorBoundary fallback={<p>The habit tracker encountered an error.</p>}>
                  <Suspense fallback={<p role="status">Loading habit tracker…</p>}>
                    <HabitTracker />
                  </Suspense>
                </ErrorBoundary>
              )}
            />
            <Route path="/todos" element={<TodoApp />} />
          </Route>
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <UpdateToast />
    </div>
  )
}
