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

export default function Validacao() {
  const { toast } = useToast()

  const handleAction = (tipo: 'aprovar' | 'rejeitar') => {
    toast({
      title: tipo === 'aprovar' ? 'Solução Aprovada' : 'Solução Rejeitada',
      description: 'Ação registrada com sucesso no sistema.',
      variant: tipo === 'aprovar' ? 'default' : 'destructive',
    })
  }

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
              Aguardando Validação
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">CH-1003</span>
          </div>
          <CardTitle className="text-xl">Atualização de cadastro</CardTitle>
          <CardDescription>Finalizado em 02/11/2023 às 10:15</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Sua Solicitação</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              Por favor, atualizem nosso endereço de faturamento para o novo escritório na Av.
              Paulista, 1000.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-primary">Solução Proposta (Atendente)</h4>
            <p className="text-sm text-foreground bg-primary/5 p-3 rounded-md border border-primary/10">
              Endereço de faturamento atualizado no ERP conforme solicitado. As próximas faturas já
              serão emitidas com os novos dados. Por favor, confirme se está tudo correto no seu
              painel financeiro.
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
