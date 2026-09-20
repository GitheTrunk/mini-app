import { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../context/auth-context'
import LiveClock from './LiveClock'

export default function NavBar() {
  const auth = useContext(AuthContext)
  const [email, setEmail] = useState('')

  if (auth === undefined) {
    throw new Error('NavBar must be used inside AuthProvider')
  }

  const { user, signIn, signOut } = auth

  return (
    <header className="site-header">
      <div className="brand">React practice</div>

      <nav aria-label="Main navigation">
        <NavLink to="/todos">Todos</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/cart">Cart</NavLink>
      </nav>

      {user ? (
        <div>
          <p>Hi, {user.email}!</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            onClick={() => signIn(email)}
            disabled={email.trim() === ''}
            >
                Sign In
            </button>
        </div>
      )}
      <LiveClock />
    </header>
  )
}
