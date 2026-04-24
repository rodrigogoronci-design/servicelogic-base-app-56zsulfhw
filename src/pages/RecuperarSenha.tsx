import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function RecuperarSenha() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-elevation border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
          <CardDescription className="text-base">
            Digite seu e-mail para receber as instruções de recuperação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" className="h-11" />
            </div>
            <Button type="button" className="w-full h-11 text-base shadow-sm">
              Enviar Instruções
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
