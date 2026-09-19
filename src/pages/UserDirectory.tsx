import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../types/user'

type DirectoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; users: User[] }

export default function UserDirectory() {
  const [state, setState] = useState<DirectoryState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users')
        if (!response.ok) throw new Error('Could not load users')
        const users: User[] = await response.json()
        if (!cancelled) setState({ status: 'success', users })
      } catch {
        if (!cancelled) {
          setState({ status: 'error', message: 'Could not load users. Please try again later.' })
        }
      }
    }

    void loadUsers()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Data fetching</p>
        <h1>User directory</h1>
        <p>People loaded from JSONPlaceholder.</p>
      </div>
      {state.status === 'loading' && (
        <div className="skeleton-list" role="status" aria-label="Loading users">
          <span className="skeleton" /><span className="skeleton" /><span className="skeleton" />
        </div>
      )}
      {state.status === 'error' && <p role="alert" className="message error">{state.message}</p>}
      {state.status === 'success' && state.users.length === 0 && (
        <p className="empty-state">No users were returned.</p>
      )}
      {state.status === 'success' && state.users.length > 0 && (
        <ul className="user-list">
          {state.users.map((user) => (
            <li key={user.id}>
              <Link to={`/users/${user.id}`}>
                <span><strong>{user.name}</strong><small>@{user.username}</small></span>
                <span className="user-link-end">View profile →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
