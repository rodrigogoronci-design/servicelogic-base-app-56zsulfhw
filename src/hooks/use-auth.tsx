import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Usuario } from '@/types'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: Usuario | null
  isLoading: boolean
  login: (email: string, senha?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(pb.authStore.record as unknown as Usuario | null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record as unknown as Usuario | null)
    })
    setIsLoading(false)
    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, senha?: string) => {
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, senha || '')
    } catch (error) {
      setIsLoading(false)
      throw new Error('Credenciais inválidas')
    }
    setIsLoading(false)
  }

  const logout = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
