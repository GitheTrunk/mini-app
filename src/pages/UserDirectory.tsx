import { useState } from 'react'
import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import useDebounce from '../hooks/useDebounce'
import type { User } from '../types/user'

const url = 'https://jsonplaceholder.typicode.com/users'

export default function UserDirectory() {
  const { data, loading, error } = useFetch<User[]>(url)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const visibleUsers = data?.filter((user) =>
    user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user.username.toLowerCase().includes(debouncedSearch.toLowerCase()),
  )

  return (
    <section className="page panel">
      <div className="page-heading">
        <p className="eyebrow">Data fetching</p>
        <h1>User directory</h1>
        <p>People loaded from JSONPlaceholder.</p>
      </div>
      <div className="user-search">
        <label htmlFor="user-search">Search users</label>
        <input id="user-search" value={search} onChange={(event) => setSearch(event.target.value)} />
        <p>Raw value: {search}</p>
        <p>Debounced value: {debouncedSearch}</p>
      </div>
      {loading && (
        <div className="skeleton-list" role="status" aria-label="Loading users">
          <span className="skeleton" /><span className="skeleton" /><span className="skeleton" />
        </div>
      )}
      {!loading && error !== null && <p role="alert" className="message error">Could not load users. Please try again later.</p>}
      {!loading && error === null && visibleUsers !== undefined && visibleUsers.length === 0 && (
        <p className="empty-state">{data?.length === 0 ? 'No users were returned.' : 'No matching users.'}</p>
      )}
      {!loading && error === null && visibleUsers !== undefined && visibleUsers.length > 0 && (
        <ul className="user-list">
          {visibleUsers.map((user) => (
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
