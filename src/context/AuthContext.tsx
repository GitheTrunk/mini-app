import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let receivedAuthEvent = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        receivedAuthEvent = true

        if (isMounted) {
          setSession(nextSession)
          setLoading(false)
        }
      },
    )

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!isMounted || receivedAuthEvent) {
          return
        }

        if (error) {
          console.error('Unable to restore the Supabase session:', error.message)
        }

        setSession(data.session)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (!isMounted || receivedAuthEvent) {
          return
        }

        console.error('Unable to restore the Supabase session:', error)
        setSession(null)
        setLoading(false)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    signOut: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    },
  }), [loading, session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
