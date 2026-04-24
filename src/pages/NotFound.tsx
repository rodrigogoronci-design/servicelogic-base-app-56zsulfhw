import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in-up">
        <h1 className="text-7xl font-bold text-primary tracking-tighter">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground text-base">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
        </div>
        <Button asChild size="lg" className="h-11 shadow-sm mt-4">
          <Link to="/">
            <Home className="mr-2 size-5" />
            Voltar para o Início
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
