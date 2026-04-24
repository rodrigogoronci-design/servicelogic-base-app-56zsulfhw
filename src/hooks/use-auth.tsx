import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Usuario } from '@/types'
import { MOCK_USERS } from '@/mocks'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: Usuario | null
  isLoading: boolean
  login: (email: string, senha?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem('@servicelogic:user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, senha?: string) => {
    setIsLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const foundUser = MOCK_USERS.find((u) => u.email === email)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem('@servicelogic:user', JSON.stringify(foundUser))
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${foundUser.nome}!`,
      })
    } else {
      setIsLoading(false)
      throw new Error('Credenciais inválidas')
    }
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('@servicelogic:user')
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
