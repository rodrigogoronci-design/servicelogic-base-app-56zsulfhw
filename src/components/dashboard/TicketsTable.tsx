import {
  Inbox,
  ArrowUpDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Plus,
} from 'lucide-react'
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

interface TicketsTableProps {
  chamados: Chamado[]
  onRowClick?: (chamado: Chamado) => void
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

export function TicketsTable({
  chamados,
  onRowClick,
  sortField,
  sortDirection,
  onSort,
}: TicketsTableProps) {
  const isMobile = useIsMobile()
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200'
      case 'Aguardando Cliente':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200'
      case 'Em Análise':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100/80 border-purple-200'
      case 'Fechado':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'text-red-600 font-semibold flex items-center gap-1'
      case 'Média':
        return 'text-amber-600 font-medium flex items-center gap-1'
      default:
        return 'text-muted-foreground flex items-center gap-1'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <AlertCircle className="size-3 mr-1" />
      case 'Aguardando Cliente':
        return <HelpCircle className="size-3 mr-1" />
      case 'Fechado':
        return <CheckCircle2 className="size-3 mr-1" />
      default:
        return <Clock className="size-3 mr-1" />
    }
  }

  const handleSort = (field: string) => {
    if (onSort) onSort(field)
  }

  const SortableHead = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={cn(
            'size-3',
            sortField === field ? 'text-foreground' : 'text-muted-foreground/30',
          )}
        />
      </div>
    </TableHead>
  )

  if (chamados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-background border-dashed">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Nenhum chamado encontrado</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Você não possui nenhum chamado ativo no momento.
        </p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        {chamados.map((chamado) => (
          <div
            key={chamado.id}
            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer hover:bg-muted/50 transition-colors flex flex-col gap-3"
            onClick={() => onRowClick && onRowClick(chamado)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {chamado.numero}
                </span>
                <h4 className="font-medium line-clamp-1">{chamado.titulo}</h4>
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

            <div className="text-sm text-muted-foreground line-clamp-2">
              {chamado.expand?.cliente_id?.nome || 'Cliente Desconhecido'}
            </div>

            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
              <span className={getPrioridadeColor(chamado.prioridade)}>
                <AlertCircle className="size-3" />
                {chamado.prioridade}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {chamado.tempo_decorrido ? `${chamado.tempo_decorrido}h` : '0h'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-background overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead field="numero">ID</SortableHead>
            <TableHead>Título / Cliente</TableHead>
            <SortableHead field="status">Status</SortableHead>
            <SortableHead field="prioridade">Prioridade</SortableHead>
            <SortableHead field="created">Data Criação</SortableHead>
            <SortableHead field="tempo_decorrido">Tempo Dec.</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chamados.map((chamado) => (
            <TableRow
              key={chamado.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors group"
              onClick={() => onRowClick && onRowClick(chamado)}
            >
              <TableCell className="font-medium">{chamado.numero}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground truncate max-w-[250px] md:max-w-[400px]">
                    {chamado.titulo}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[250px] md:max-w-[400px]">
                    {chamado.expand?.cliente_id?.nome || 'Cliente Desconhecido'}
                  </span>
                </div>
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
              <TableCell>
                <span className={getPrioridadeColor(chamado.prioridade)}>{chamado.prioridade}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(chamado.created).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {chamado.tempo_decorrido ? `${chamado.tempo_decorrido}h` : '0h'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
