import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import HabitTracker from './pages/HabitTracker'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import TodoApp from './pages/TodoApp'
import UserDetail from './pages/UserDetail'
import UserDirectory from './pages/UserDirectory'
import CartPage from './pages/CartPage'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/habits" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/todos" element={<TodoApp />} />
          </Route>
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
