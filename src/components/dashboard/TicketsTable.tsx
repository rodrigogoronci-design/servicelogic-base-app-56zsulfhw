import { Inbox } from 'lucide-react'
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

interface TicketsTableProps {
  chamados: Chamado[]
}

export function TicketsTable({ chamados }: TicketsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-blue-200'
      case 'Pendente':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-amber-200'
      case 'Resolvido':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-200'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
      case 'Urgente':
        return 'text-red-600 font-semibold'
      case 'Média':
        return 'text-amber-600 font-medium'
      default:
        return 'text-muted-foreground'
    }
  }

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

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Prioridade</TableHead>
            <TableHead className="text-right">Tempo Decorrido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chamados.map((chamado) => (
            <TableRow
              key={chamado.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{chamado.numero}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground truncate max-w-[200px] md:max-w-[400px]">
                    {chamado.titulo}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[400px]">
                    {chamado.descricao}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(chamado.status)}>
                  {chamado.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={getPrioridadeColor(chamado.prioridade)}>{chamado.prioridade}</span>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {chamado.tempo_decorrido}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
