import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { User } from '../types/user'

type DetailState =
  | { status: 'loading'; id: string }
  | { status: 'error'; id: string }
  | { status: 'missing'; id: string }
  | { status: 'success'; id: string; user: User }

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const requestedId = id ?? ''
  const [state, setState] = useState<DetailState>({ status: 'loading', id: requestedId })

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      if (!/^\d+$/.test(requestedId)) {
        if (!cancelled) setState({ status: 'missing', id: requestedId })
        return
      }
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${requestedId}`)
        if (response.status === 404) {
          if (!cancelled) setState({ status: 'missing', id: requestedId })
          return
        }
        if (!response.ok) throw new Error('Could not load user')
        const user: User = await response.json()
        if (!cancelled) setState({ status: 'success', id: requestedId, user })
      } catch {
        if (!cancelled) setState({ status: 'error', id: requestedId })
      }
    }

    void loadUser()
    return () => { cancelled = true }
  }, [requestedId])

  // A route change renders before its effect runs; hide the previous user's data immediately.
  const visibleState = state.id === requestedId ? state : { status: 'loading' as const }

  return (
    <section className="page panel">
      <Link className="back-link" to="/users">← All users</Link>
      {visibleState.status === 'loading' && <p role="status" className="message">Loading user…</p>}
      {visibleState.status === 'error' && <p role="alert" className="message error">Could not load this user. Please try again later.</p>}
      {visibleState.status === 'missing' && <p className="message">User not found.</p>}
      {visibleState.status === 'success' && (
        <>
          <div className="page-heading">
            <p className="eyebrow">User profile</p>
            <h1>{visibleState.user.name}</h1>
            <p>@{visibleState.user.username}</p>
          </div>
          <dl className="user-details">
            <div><dt>Email</dt><dd>{visibleState.user.email}</dd></div>
            <div><dt>Phone</dt><dd>{visibleState.user.phone}</dd></div>
            <div><dt>City</dt><dd>{visibleState.user.address.city}</dd></div>
            <div><dt>Company</dt><dd>{visibleState.user.company.name}</dd></div>
          </dl>
        </>
      )}
    </section>
  )
}
