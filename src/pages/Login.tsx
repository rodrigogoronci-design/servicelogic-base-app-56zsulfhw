import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido' }),
  senha: z.string().min(1, { message: 'A senha é obrigatória' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.senha)
      // Redirection is handled implicitly by ProtectedRoute or can be done here.
      // Let's rely on ProtectedRoute logic, but we navigate to / to re-trigger check
      navigate('/', { replace: true })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Erro ao carregar dados. Tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-elevation border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-2 shadow-sm">
            SL
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo(a)</CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o Servicelogic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        className="h-11"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link
                        to="/recuperar-senha"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Esqueci minha senha
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-11 text-base shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-muted/20 px-6 py-4">
          <div className="text-sm text-muted-foreground text-center">
            Dica: Use <strong className="text-foreground">atendente@servicelogic.com</strong> ou{' '}
            <strong className="text-foreground">cliente@empresa.com</strong>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
