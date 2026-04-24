import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getValidacoes } from '@/services/validacoes'
import { Validacao } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'

export default function ValidacaoPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [validacoes, setValidacoes] = useState<Validacao[]>([])

  const loadData = async () => {
    try {
      const data = await getValidacoes()
      setValidacoes(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('validacoes', () => {
    loadData()
  })

  const handleAction = (tipo: 'aprovar' | 'rejeitar') => {
    toast({
      title: tipo === 'aprovar' ? 'Solução Aprovada' : 'Solução Rejeitada',
      description: 'Ação registrada com sucesso no sistema.',
      variant: tipo === 'aprovar' ? 'default' : 'destructive',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (validacoes.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Validação de Solução</h1>
          <p className="text-muted-foreground">
            Analise e aprove as soluções propostas para seus chamados.
          </p>
        </div>
        <Card className="border-border shadow-sm p-12 text-center text-muted-foreground">
          Nenhuma validação pendente no momento.
        </Card>
      </div>
    )
  }

  const validacao = validacoes[0]

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Validação de Solução</h1>
        <p className="text-muted-foreground">
          Analise e aprove as soluções propostas para seus chamados.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              {validacao.status === 'Pendente' ? 'Aguardando Validação' : validacao.status}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">CH-1003</span>
          </div>
          <CardTitle className="text-xl">Atualização de cadastro</CardTitle>
          <CardDescription>
            {validacao.data_validacao
              ? `Finalizado em ${new Date(validacao.data_validacao).toLocaleDateString()}`
              : 'Aguardando sua ação'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Sua Solicitação</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              Por favor, verifique a solução proposta para o seu chamado.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-primary">Solução Proposta (Atendente)</h4>
            <p className="text-sm text-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
              {validacao.comentario || 'Solução aplicada. Por favor confirme.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t bg-muted/10 px-6 py-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-1/2 h-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleAction('rejeitar')}
          >
            <XCircle className="mr-2 size-5" />
            Rejeitar Solução
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-1/2 h-11 shadow-sm"
            onClick={() => handleAction('aprovar')}
          >
            <CheckCircle2 className="mr-2 size-5" />
            Aprovar e Fechar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
