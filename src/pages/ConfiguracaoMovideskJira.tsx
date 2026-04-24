import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save, Trash, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  getMovideskJiraConfig,
  saveMovideskJiraConfig,
  testMovideskConnection,
  testJiraConnection,
} from '@/services/integracoes'

const schema = z.object({
  url: z
    .string()
    .url('URL inválida')
    .refine((s) => s.startsWith('https://'), 'Deve começar com https://'),
  token: z.string().refine((s) => s.includes('****') || s.length >= 30, 'Mínimo de 30 caracteres'),
})

type FormData = z.infer<typeof schema>

interface IntegrationFormProps {
  type: 'movidesk' | 'jira'
  title: string
  cardClasses: string
  labelClasses?: string
  inputClasses?: string
  urlPlaceholder: string
  tokenPlaceholder: string
  initialData: any
  testFn: (data: any) => Promise<any>
}

function IntegrationForm({
  type,
  title,
  cardClasses,
  labelClasses,
  inputClasses,
  urlPlaceholder,
  tokenPlaceholder,
  initialData,
  testFn,
}: IntegrationFormProps) {
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { url: '', token: '' },
    mode: 'onChange',
  })

  const onSave = async (data: FormData) => {
    setSaving(true)
    try {
      await saveMovideskJiraConfig({ [type]: data })
      toast.success('Credenciais salvas com segurança')
      setTimeout(() => window.location.reload(), 2000)
    } catch (e: any) {
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const onTest = async () => {
    const values = form.getValues()
    const res = schema.safeParse(values)
    if (!res.success) {
      form.trigger()
      return
    }
    setTesting(true)
    try {
      await testFn(values)
      toast.success('Conexão testada com sucesso!')
    } catch (e: any) {
      const msg = e.response?.mensagem || getErrorMessage(e)
      toast.error(msg)
    } finally {
      setTesting(false)
    }
  }

  const onClear = () => {
    form.reset({ url: '', token: '' })
  }

  return (
    <Card className={cn('w-full h-full flex flex-col', cardClasses)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClasses}>URL da Instância / API</FormLabel>
                  <FormControl>
                    <Input placeholder={urlPlaceholder} className={inputClasses} {...field} />
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
                  <FormLabel className={labelClasses}>Token de Autenticação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={tokenPlaceholder}
                      className={cn('resize-none h-24', inputClasses)}
                      style={{ WebkitTextSecurity: 'disc' } as any}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-4 justify-end">
        <Button
          variant="secondary"
          onClick={onTest}
          disabled={testing || saving}
          className="w-full sm:w-auto"
        >
          {testing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Activity className="mr-2 h-4 w-4" />
          )}
          Testar
        </Button>
        <Button
          variant="destructive"
          onClick={onClear}
          disabled={testing || saving}
          className="w-full sm:w-auto"
        >
          <Trash className="mr-2 h-4 w-4" />
          Limpar
        </Button>
        <Button
          onClick={form.handleSubmit(onSave)}
          disabled={!form.formState.isValid || saving}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
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
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1000px] mx-auto w-full">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full h-[400px] flex flex-col p-6 space-y-4">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-[70px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <div className="flex gap-2 justify-end pt-4 mt-auto">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrações Movidesk e Jira</h2>
        <p className="text-muted-foreground">Configure as credenciais de acesso às plataformas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationForm
          type="movidesk"
          title="Movidesk"
          cardClasses="bg-blue-50 border-blue-200"
          urlPlaceholder="https://atendimento.movidesk.com..."
          tokenPlaceholder="Cole aqui o token da API Movidesk"
          initialData={data?.movidesk}
          testFn={testMovideskConnection}
        />
        <IntegrationForm
          type="jira"
          title="Jira"
          cardClasses="bg-slate-900 border-slate-700 text-slate-50"
          labelClasses="text-slate-200"
          inputClasses="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          urlPlaceholder="https://servicelogic-es.atlassian.net"
          tokenPlaceholder="Cole aqui o token da API Jira"
          initialData={data?.jira}
          testFn={testJiraConnection}
        />
      </div>
    </div>
  )
}
