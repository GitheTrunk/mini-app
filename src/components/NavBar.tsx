import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LiveClock from './LiveClock'
import ProfileAvatar from './ProfileAvatar'
import ShareButton from './ShareButton'

export default function NavBar() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')

    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out. Please try again.')
    }
  }

  return (
    <header className="site-header">
      <div className="brand">React practice</div>

      <nav aria-label="Main navigation">
        <NavLink to="/habits">Habits</NavLink>
        <NavLink to="/todos">Todos</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/cart">Cart</NavLink>
      </nav>

      <div className="auth-summary">
        {!loading && user ? (
          <>
            <ProfileAvatar />
            <span title={user.email}>Hi, {user.email ?? 'there'}!</span>
            <button className="secondary-button" type="button" onClick={handleSignOut}>Sign out</button>
          </>
        ) : !loading ? (
          <NavLink to="/login">Sign in</NavLink>
        ) : null}
        {signOutError && <span className="header-error" role="alert">{signOutError}</span>}
      </div>
      <ShareButton />
      <LiveClock />
    </header>
  )
}
