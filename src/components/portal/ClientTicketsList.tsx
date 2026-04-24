import { Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { Chamado } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface ClientTicketsListProps {
  chamados: Chamado[]
  onRowClick: (chamado: Chamado) => void
  onValidate: (chamado: Chamado) => void
}

export function ClientTicketsList({ chamados, onRowClick, onValidate }: ClientTicketsListProps) {
  const isMobile = useIsMobile()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Aguardando Cliente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Fechado':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <AlertCircle className="size-3 mr-1" />
      case 'Fechado':
        return <CheckCircle2 className="size-3 mr-1" />
      default:
        return <Clock className="size-3 mr-1" />
    }
  }

  if (isMobile) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        {chamados.map((chamado) => (
          <div
            key={chamado.id}
            className={cn(
              'p-4 rounded-xl border bg-card text-card-foreground shadow-sm cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden',
              chamado.status === 'Aguardando Cliente'
                ? 'border-yellow-300 shadow-[0_0_15px_-3px_rgba(253,224,71,0.2)]'
                : 'hover:border-primary/30',
            )}
            onClick={() => onRowClick(chamado)}
          >
            {chamado.status === 'Aguardando Cliente' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400" />
            )}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {chamado.numero}
                </span>
                <h4 className="font-medium line-clamp-1 mt-0.5">{chamado.titulo}</h4>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'whitespace-nowrap flex items-center',
                  getStatusColor(chamado.status),
                )}
              >
                {getStatusIcon(chamado.status)}
                {chamado.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm mt-1 pt-3 border-t">
              <span className="text-muted-foreground font-medium">{chamado.prioridade}</span>
              <span className="text-muted-foreground text-xs">
                {new Date(chamado.created).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {chamado.status === 'Aguardando Cliente' ? (
              <Button
                size="sm"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  onValidate(chamado)
                }}
              >
                Validar Solução
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground">
                Ver Detalhes
                <ChevronRight className="ml-1 size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden animate-fade-in-up shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[100px]">Número</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Data Criação</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chamados.map((chamado) => (
            <TableRow
              key={chamado.id}
              className={cn(
                'cursor-pointer transition-colors group',
                chamado.status === 'Aguardando Cliente'
                  ? 'bg-yellow-50/30 hover:bg-yellow-50/60 border-l-4 border-l-yellow-400'
                  : 'hover:bg-muted/50 border-l-4 border-l-transparent',
              )}
              onClick={() => onRowClick(chamado)}
            >
              <TableCell className="font-medium">{chamado.numero}</TableCell>
              <TableCell>
                <span className="font-medium text-foreground truncate block max-w-[300px]">
                  {chamado.titulo}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('flex items-center w-fit', getStatusColor(chamado.status))}
                >
                  {getStatusIcon(chamado.status)}
                  {chamado.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{chamado.prioridade}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(chamado.created).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">
                {chamado.status === 'Aguardando Cliente' ? (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onValidate(chamado)
                    }}
                  >
                    Validar Solução
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Detalhes
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
