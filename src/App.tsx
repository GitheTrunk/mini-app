import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import LiveClock from './components/LiveClock'
import NotFound from './pages/NotFound'
import TodoApp from './pages/TodoApp'
import UserDetail from './pages/UserDetail'
import UserDirectory from './pages/UserDirectory'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">React practice</div>
        <nav aria-label="Main navigation">
          <NavLink to="/todos">Todos</NavLink>
          <NavLink to="/users">Users</NavLink>
        </nav>
        <LiveClock />
      </header>
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
