import { useState, type FormEvent } from 'react'
import type { AuthError } from '@supabase/supabase-js'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface LoginLocationState {
  from?: {
    pathname?: string
    search?: string
    hash?: string
  }
}

function getErrorMessage(error: AuthError) {
  if (error.message.toLowerCase().includes('invalid login credentials')) {
    return 'The email or password is incorrect.'
  }

  if (error.message.toLowerCase().includes('email not confirmed')) {
    return 'Confirm your email address before signing in.'
  }

  if (error.message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  return error.message
}

export default function Login() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const state = location.state as LoginLocationState | null
  const destination = state?.from
    ? `${state.from.pathname ?? '/habits'}${state.from.search ?? ''}${state.from.hash ?? ''}`
    : '/habits'

  if (authLoading) {
    return <div className="auth-loading" role="status">Restoring your session…</div>
  }

  if (user) {
    return <Navigate to={destination} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const credentials = { email: email.trim(), password }
      const result = mode === 'sign-in'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials)

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error))
        return
      }

      if (mode === 'sign-up' && !result.data.session) {
        setSuccessMessage('Account created. Check your email to confirm your address, then sign in.')
        return
      }

      navigate(destination, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reach the authentication service.')
    } finally {
      setSubmitting(false)
    }
  }

  function changeMode(nextMode: 'sign-in' | 'sign-up') {
    setMode(nextMode)
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <section className="login-page panel">
      <div className="page-heading">
        <p className="eyebrow">Habit tracker</p>
        <h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
        <p>
          {mode === 'sign-in'
            ? 'Sign in to continue to your habits.'
            : 'Sign up with your email and a secure password.'}
        </p>
      </div>

      <div className="auth-tabs" aria-label="Authentication options">
        <button
          className={mode === 'sign-in' ? 'selected' : ''}
          type="button"
          onClick={() => changeMode('sign-in')}
          disabled={submitting}
        >
          Sign in
        </button>
        <button
          className={mode === 'sign-up' ? 'selected' : ''}
          type="button"
          onClick={() => changeMode('sign-up')}
          disabled={submitting}
        >
          Sign up
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={submitting}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={submitting}
        />

        {errorMessage && <p className="auth-message error" role="alert">{errorMessage}</p>}
        {successMessage && <p className="auth-message success" role="status">{successMessage}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting
            ? (mode === 'sign-in' ? 'Signing in…' : 'Creating account…')
            : (mode === 'sign-in' ? 'Sign in' : 'Create account')}
        </button>
      </form>
    </section>
  )
}
