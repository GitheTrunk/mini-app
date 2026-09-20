import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import type { User } from '../types/user'

const url = 'https://jsonplaceholder.typicode.com/users'

export default function UserDirectory() {
  const { data, loading, error } = useFetch<User[]>(url)

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Data fetching</p>
        <h1>User directory</h1>
        <p>People loaded from JSONPlaceholder.</p>
      </div>
      {loading && (
        <div className="skeleton-list" role="status" aria-label="Loading users">
          <span className="skeleton" /><span className="skeleton" /><span className="skeleton" />
        </div>
      )}
      {!loading && error !== null && <p role="alert" className="message error">Could not load users. Please try again later.</p>}
      {!loading && error === null && data !== null && data.length === 0 && (
        <p className="empty-state">No users were returned.</p>
      )}
      {!loading && error === null && data !== null && data.length > 0 && (
        <ul className="user-list">
          {data.map((user) => (
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
