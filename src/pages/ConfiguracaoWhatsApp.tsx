import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Play, Trash2, Save, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

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
  const [shake, setShake] = useState(false)
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
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Erro ao carregar</span>
            </div>
          ),
          description: getErrorMessage(error),
          className: 'bg-red-50 text-red-900 border-red-200 shadow-md',
          duration: 4000,
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
      const res = await saveWhatsAppConfig(data)
      const mensagem = res?.data?.mensagem || 'Credenciais salvas com segurança'
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>{mensagem}</span>
          </div>
        ),
        className: 'bg-green-50 text-green-900 border-green-200 shadow-md',
        duration: 4000,
      })
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Erro ao salvar</span>
          </div>
        ),
        description: getErrorMessage(error),
        className: 'bg-red-50 text-red-900 border-red-200 shadow-md',
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onError = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleTestConnection = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      onError()
      return
    }

    setIsTesting(true)
    try {
      const data = form.getValues()
      const res = await testWhatsAppConnection(data)
      if (res.sucesso) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Conexão testada com sucesso!</span>
            </div>
          ),
          description: res.mensagem,
          className: 'bg-green-50 text-green-900 border-green-200 shadow-md',
          duration: 4000,
        })
      }
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Falha no teste</span>
          </div>
        ),
        description: getErrorMessage(error),
        className: 'bg-red-50 text-red-900 border-red-200 shadow-md',
        duration: 4000,
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full md:w-[90%] lg:max-w-[500px] mx-auto px-4 md:px-0 py-8">
        <Card className="shadow-md border-gray-200 p-4 sm:p-8 rounded-lg">
          <CardHeader className="px-0 pt-0">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full md:w-[90%] lg:max-w-[500px] mx-auto px-4 md:px-0 py-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <Card className="relative shadow-md border-gray-200 p-4 sm:p-8 rounded-lg overflow-hidden">
        {isTesting && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300">
            <Loader2 className="h-10 w-10 text-gray-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium text-lg">Testando conexão...</p>
          </div>
        )}

        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl text-gray-900">Z-API WhatsApp</CardTitle>
          <CardDescription className="text-gray-600 text-sm mt-1">
            Configure as credenciais para envio de notificações via WhatsApp. Os dados sensíveis são
            armazenados de forma segura.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0 mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className={cn('space-y-5', shake && 'animate-shake')}
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field, fieldState }) => {
                  const isError = !!fieldState.error
                  const isValid = !isError && fieldState.isDirty && !!field.value
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-900">API URL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="https://notificacao.api.v2.slhub.com.br/v1/api/zapi/send-message"
                            {...field}
                            aria-invalid={isError}
                            className={cn(
                              'pr-10 focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                              isError
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : isValid
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : '',
                            )}
                          />
                          {isError && (
                            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500 pointer-events-none" />
                          )}
                          {isValid && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500 pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="dominio"
                render={({ field, fieldState }) => {
                  const isError = !!fieldState.error
                  const isValid = !isError && fieldState.isDirty && !!field.value
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-900">Domínio</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="servicelogic"
                            {...field}
                            aria-invalid={isError}
                            className={cn(
                              'pr-10 focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                              isError
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : isValid
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : '',
                            )}
                          />
                          {isError && (
                            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500 pointer-events-none" />
                          )}
                          {isValid && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500 pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field, fieldState }) => {
                  const isError = !!fieldState.error
                  const isValid = !isError && fieldState.isDirty && !!field.value
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-900">Token Bearer</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Cole aqui o token completo (sem 'Bearer ')"
                            className={cn(
                              'resize-none h-24 font-mono text-sm [text-security:disc] [-webkit-text-security:disc] pr-10 focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                              isError
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : isValid
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : '',
                            )}
                            {...field}
                            aria-invalid={isError}
                          />
                          {isError && (
                            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500 pointer-events-none" />
                          )}
                          {isValid && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500 pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="numeroTelefone"
                render={({ field, fieldState }) => {
                  const isError = !!fieldState.error
                  const isValid = !isError && fieldState.isDirty && !!field.value
                  return (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-900">
                        Número de Telefone Padrão
                      </FormLabel>
                      <FormDescription className="text-gray-600 text-sm mb-2">
                        Número para testes de envio (com DDD)
                      </FormDescription>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="DDD99999999"
                            {...field}
                            aria-invalid={isError}
                            className={cn(
                              'pr-10 focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
                              isError
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : isValid
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : '',
                            )}
                          />
                          {isError && (
                            <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500 pointer-events-none" />
                          )}
                          {isValid && (
                            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500 pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  aria-label="Salvar Configuração"
                  className="h-11 flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:bg-gray-400"
                  disabled={isSaving || isTesting}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar Configuração
                </Button>

                <Button
                  type="button"
                  aria-label="Testar Conexão"
                  variant="secondary"
                  className="h-11 flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
                  onClick={handleTestConnection}
                  disabled={isSaving || isTesting}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Testar Conexão
                </Button>

                <Button
                  type="button"
                  aria-label="Limpar Campos"
                  variant="destructive"
                  className="h-11 bg-red-100 hover:bg-red-200 text-red-900 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 sm:w-auto w-full px-4"
                  onClick={() =>
                    form.reset({ url: '', dominio: '', token: '', numeroTelefone: '' })
                  }
                  disabled={isSaving || isTesting}
                >
                  <Trash2 className="mr-2 h-4 w-4 sm:mr-0" />
                  <span className="sm:hidden">Limpar Campos</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
