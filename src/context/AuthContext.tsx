import { useState, type ReactNode } from 'react'
import { AuthContext, type User } from './auth-context'

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)

    const signIn = (email: string): void => {
        setUser({ email })
    }

    const signOut = (): void => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            { children }
        </AuthContext.Provider>
    )
}
