import { createContext } from 'react'

export interface User {
    email: string
}

export interface AuthContextType {
    user: User | null
    signIn: (email: string) => void
    signOut: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
