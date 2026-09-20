import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import NotFound from './pages/NotFound'
import TodoApp from './pages/TodoApp'
import UserDetail from './pages/UserDetail'
import UserDirectory from './pages/UserDirectory'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="/todos" element={<TodoApp />} />
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
