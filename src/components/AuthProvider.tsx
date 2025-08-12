'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/src/lib/auth'

interface AuthContextType {
  user: any
  profile: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: any; error: string | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ user: any; error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}
