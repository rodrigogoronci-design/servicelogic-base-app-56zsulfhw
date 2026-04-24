import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  Save,
  Trash,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Ticket,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  getMovideskJiraConfig,
  saveMovideskJiraConfig,
  salvarCredenciaisIntegracao,
  testarConexaoIntegracao,
} from '@/services/integracoes'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  url: z
    .string()
    .min(1, 'Campo obrigatório')
    .url('URL inválida')
    .refine((s) => s.startsWith('https://'), 'Deve começar com https://'),
  token: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine((s) => s.includes('****') || s.length >= 30, 'Mínimo de 30 caracteres'),
})

type FormData = z.infer<typeof schema>

function IntegrationForm({
  type,
  title,
  desc,
  border,
  icon,
  urlPlaceholder,
  tokenPlaceholder,
  initialData,
  testFn,
}: any) {
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [shake, setShake] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { url: '', token: '' },
    mode: 'onChange',
  })

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const showToast = (type: 'success' | 'error', msg: string) => {
    const isError = type === 'error'
    toast({
      description: (
        <div className="flex items-center gap-3">
          {isError ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          <span className="font-medium">{msg}</span>
        </div>
      ),
      className: isError
        ? 'bg-red-50 text-red-900 border-red-200'
        : 'bg-green-50 text-green-900 border-green-200',
      duration: 4000,
    })
  }

  const onSave = async (data: FormData) => {
    setSaving(true)
    try {
      await salvarCredenciaisIntegracao({ tipo, url: data.url, token: data.token })
      showToast('success', 'Credenciais salvas com sucesso')
      setTimeout(() => window.location.reload(), 2000)
    } catch (e: any) {
      triggerShake()
      showToast('error', e.response?.error || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const onTest = async () => {
    const values = form.getValues()
    if (!schema.safeParse(values).success) {
      form.trigger()
      triggerShake()
      return showToast('error', 'Preencha os campos corretamente.')
    }
    setTesting(true)
    try {
      const res = await testFn({ ...values, tipo: type })
      showToast('success', res?.data?.mensagem || 'Conexão testada com sucesso!')
    } catch (e: any) {
      triggerShake()
      showToast('error', e.response?.error || getErrorMessage(e))
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col shadow-md border-gray-200 rounded-lg p-8 bg-white',
        border,
        shake && 'animate-shake',
      )}
    >
      {testing && (
        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
          <span className="text-sm font-medium text-gray-700">Testando conexão...</span>
        </div>
      )}
      <CardHeader className="px-0 pt-0 pb-6 flex-row items-center gap-3 space-y-0">
        <div className="p-2 bg-gray-50 rounded-md">{icon}</div>
        <div>
          <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-0.5">{desc}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-0 pb-6">
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field, fieldState: { isDirty, invalid } }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-900">
                    URL da Instância / API
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600">
                    Endereço base para comunicação com o serviço.
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={urlPlaceholder}
                        className={cn(
                          'h-11 pr-10 focus-visible:ring-blue-500',
                          isDirty && !invalid && 'border-green-500 focus-visible:ring-green-500',
                          invalid && 'border-red-500 focus-visible:ring-red-500',
                        )}
                        {...field}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {isDirty && !invalid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {invalid && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field, fieldState: { isDirty, invalid } }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-900">
                    Token de Autenticação
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600">
                    Chave de acesso seguro gerada na plataforma.
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        placeholder={tokenPlaceholder}
                        className={cn(
                          'h-11 pr-20 focus-visible:ring-blue-500',
                          isDirty && !invalid && 'border-green-500 focus-visible:ring-green-500',
                          invalid && 'border-red-500 focus-visible:ring-red-500',
                        )}
                        {...field}
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                        {isDirty && !invalid && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 pointer-events-none" />
                        )}
                        {invalid && (
                          <XCircle className="h-5 w-5 text-red-500 pointer-events-none" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                          {showToken ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="px-0 pt-6 border-t border-gray-100 flex flex-wrap sm:flex-nowrap gap-3 justify-end mt-auto pb-0">
        <Button
          variant="outline"
          onClick={() => form.reset({ url: '', token: '' })}
          disabled={testing || saving}
          className="w-full sm:w-auto h-11 bg-red-50 text-red-600 border-transparent hover:bg-red-100 hover:text-red-700 transition-colors duration-200 hover:scale-[1.02]"
          aria-label={`Limpar formulário do ${title}`}
        >
          <Trash className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
        <Button
          variant="secondary"
          onClick={onTest}
          disabled={testing || saving}
          className="w-full sm:w-auto h-11 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors duration-200 hover:scale-[1.02]"
          aria-label={`Testar conexão com ${title}`}
        >
          <Play className="mr-2 h-4 w-4" aria-hidden="true" />
          Testar
        </Button>
        <Button
          onClick={form.handleSubmit(onSave)}
          disabled={!form.formState.isValid || saving}
          className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-800 text-white transition-colors duration-200 hover:scale-[1.02] disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:scale-100"
          aria-label={`Salvar credenciais do ${title}`}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Salvar
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ConfiguracaoMovideskJira() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getMovideskJiraConfig()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-fade-in-up max-w-[1000px] mx-auto space-y-8 w-full">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="h-[450px] p-8 space-y-6">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up max-w-[1000px] mx-auto space-y-8 pb-12 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Integrações Externas</h2>
        <p className="text-gray-600 mt-1">Configure as credenciais de Movidesk e Jira</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IntegrationForm
          type="movidesk"
          title="Movidesk"
          desc="Sistema de Help Desk e Atendimento."
          border="border-l-4 border-l-blue-400"
          icon={<LayoutDashboard className="h-6 w-6 text-blue-500" />}
          urlPlaceholder="https://atendimento.movidesk.com..."
          tokenPlaceholder="Cole aqui o token da API Movidesk"
          initialData={data?.movidesk}
          testFn={testarConexaoIntegracao}
        />
        <IntegrationForm
          type="jira"
          title="Jira"
          desc="Gestão de Projetos e Desenvolvimento."
          border="border-l-4 border-l-blue-700"
          icon={<Ticket className="h-6 w-6 text-blue-700" />}
          urlPlaceholder="https://sua-empresa.atlassian.net"
          tokenPlaceholder="Cole aqui o token da API Jira"
          initialData={data?.jira}
          testFn={testarConexaoIntegracao}
        />
      </div>
    </div>
  )
}
