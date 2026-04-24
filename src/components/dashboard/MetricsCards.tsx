import { Clock, Ticket, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Chamado } from '@/types'

interface MetricsCardsProps {
  chamados: Chamado[]
}

export function MetricsCards({ chamados }: MetricsCardsProps) {
  const total = chamados.length
  const pendentes = chamados.filter(
    (c) => c.status === 'Aberto' || c.status === 'Em Análise' || c.status === 'Aguardando Cliente',
  ).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
          <Ticket className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">ativos no sistema</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <AlertCircle className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendentes}</div>
          <p className="text-xs text-muted-foreground mt-1">aguardando atendimento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Clock className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1h 45m</div>
          <p className="text-xs text-muted-foreground mt-1">de primeira resposta</p>
        </CardContent>
      </Card>
    </div>
  )
}
