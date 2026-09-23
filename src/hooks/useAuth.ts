import { useContext } from 'react'
import { AuthContext } from '../context/auth-context'

export default function useAuth() {
  const auth = useContext(AuthContext)

  if (auth === undefined) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return auth
}
