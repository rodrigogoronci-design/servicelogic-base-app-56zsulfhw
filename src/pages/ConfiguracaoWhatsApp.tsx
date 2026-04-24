import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

import { getWhatsAppConfig, saveWhatsAppConfig, testWhatsAppConnection } from '@/services/whatsapp'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const formSchema = z.object({
  url: z.string().url('URL inválida').startsWith('https://', 'Deve começar com https://'),
  dominio: z.string().min(3, 'Mínimo de 3 caracteres'),
  token: z
    .string()
    .refine(
      (val) => val.length >= 50 || val.includes('*'),
      'Token deve ter no mínimo 50 caracteres',
    ),
  numeroTelefone: z.string().regex(/^\d{10,11}$/, 'Deve conter apenas números (10 a 11 dígitos)'),
})

type FormData = z.infer<typeof formSchema>

export default function ConfiguracaoWhatsApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      dominio: '',
      token: '',
      numeroTelefone: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getWhatsAppConfig()
        form.reset({
          url: data.url || '',
          dominio: data.dominio || '',
          token: data.token || '',
          numeroTelefone: data.numeroTelefone || '',
        })
      } catch (error) {
        toast({
          title: 'Erro ao carregar',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [form, toast])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      await saveWhatsAppConfig(data)
      toast({
        title: 'Credenciais salvas com segurança',
        className: 'bg-green-600 text-white border-none',
      })
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    setIsTesting(true)
    try {
      const data = form.getValues()
      const res = await testWhatsAppConnection(data)
      if (res.sucesso) {
        toast({
          title: 'Conexão testada com sucesso!',
          description: res.mensagem,
          className: 'bg-green-600 text-white border-none',
        })
      }
    } catch (error) {
      toast({
        title: 'Falha no teste',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-[500px] mx-auto pt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFormValid = form.formState.isValid

  return (
    <div className="w-full max-w-[500px] mx-auto pt-6 pb-12 px-4 sm:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Z-API WhatsApp</CardTitle>
          <CardDescription>
            Configure as credenciais para envio de notificações via WhatsApp. Os dados sensíveis são
            armazenados de forma segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://notificacao.api.v2.slhub.com.br/v1/api/zapi/send-message"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dominio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domínio</FormLabel>
                    <FormControl>
                      <Input placeholder="servicelogic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Bearer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cole aqui o token completo (sem 'Bearer ')"
                        className="resize-none h-24 font-mono text-sm [text-security:disc] [-webkit-text-security:disc]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numeroTelefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Telefone Padrão</FormLabel>
                    <FormControl>
                      <Input placeholder="DDD99999999" {...field} />
                    </FormControl>
                    <FormDescription>Número para testes de envio</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSaving || isTesting || !isFormValid}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Configuração
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
                  onClick={handleTestConnection}
                  disabled={isSaving || isTesting || !isFormValid}
                >
                  {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar Conexão
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    form.reset({ url: '', dominio: '', token: '', numeroTelefone: '' })
                  }
                  disabled={isSaving || isTesting}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
