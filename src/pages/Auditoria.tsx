import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Download, FileJson, AlertCircle } from 'lucide-react'

import { getAllLogsForExport, getTodosLogs } from '@/services/logs'
import { LogAuditoria } from '@/types'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Auditoria() {
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [tabelaFilter, setTabelaFilter] = useState('todas')
  const [acaoFilter, setAcaoFilter] = useState('todas')

  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadData = async (currentPage: number) => {
    setLoading(true)
    setError(false)
    try {
      const data = await getTodosLogs(currentPage, 20, tabelaFilter, acaoFilter)
      setLogs(data.items)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(page)
  }, [page, tabelaFilter, acaoFilter])

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const allData = await getAllLogsForExport(tabelaFilter, acaoFilter)

      const headers = ['ID', 'Data/Hora', 'Usuário', 'Tabela', 'Ação']
      const rows = allData.map((l) => [
        l.id,
        format(new Date(l.created), 'yyyy-MM-dd HH:mm:ss'),
        l.expand?.usuario_id?.name || l.usuario_id || 'Sistema',
        l.tabela,
        l.acao,
      ])

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `auditoria_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to export', err)
    } finally {
      setExporting(false)
    }
  }

  const openDiff = (log: LogAuditoria) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  const getActionBadge = (acao: string) => {
    switch (acao) {
      case 'INSERT':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            INSERT
          </Badge>
        )
      case 'UPDATE':
        return (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
            UPDATE
          </Badge>
        )
      case 'DELETE':
        return <Badge variant="destructive">DELETE</Badge>
      default:
        return <Badge variant="secondary">{acao}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h2>
          <p className="text-muted-foreground">Monitore todas as alterações de dados no sistema.</p>
        </div>
        <Button onClick={handleExportCSV} disabled={exporting || loading || logs.length === 0}>
          <Download className="mr-2 size-4" />
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64 space-y-1">
              <label className="text-sm font-medium">Tabela</label>
              <Select
                value={tabelaFilter}
                onValueChange={(v) => {
                  setTabelaFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a tabela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as tabelas</SelectItem>
                  <SelectItem value="chamados">Chamados</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="validacoes">Validações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64 space-y-1">
              <label className="text-sm font-medium">Ação</label>
              <Select
                value={acaoFilter}
                onValueChange={(v) => {
                  setAcaoFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as ações</SelectItem>
                  <SelectItem value="INSERT">Criação (INSERT)</SelectItem>
                  <SelectItem value="UPDATE">Atualização (UPDATE)</SelectItem>
                  <SelectItem value="DELETE">Exclusão (DELETE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="rounded-md border m-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tabela</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertCircle className="size-8 text-destructive mb-2" />
                      <p>Erro ao carregar logs. Tente novamente.</p>
                      <Button variant="outline" className="mt-4" onClick={() => loadData(page)}>
                        Tentar Novamente
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhum registro de auditoria encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {log.expand?.usuario_id?.name || (
                        <span className="text-muted-foreground italic">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{log.tabela}</TableCell>
                    <TableCell>{getActionBadge(log.acao)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDiff(log)}
                        title="Ver Dados"
                      >
                        <FileJson className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4 pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes da Alteração</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 pt-4">
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-sm font-semibold mb-2 bg-muted p-2 rounded-t-md border border-b-0">
                Dados Anteriores
              </h4>
              <ScrollArea className="flex-1 border rounded-b-md p-4 bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {selectedLog?.dados_anteriores ? (
                    JSON.stringify(selectedLog.dados_anteriores, null, 2)
                  ) : (
                    <span className="text-muted-foreground italic">
                      Nenhum dado anterior (INSERT)
                    </span>
                  )}
                </pre>
              </ScrollArea>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="text-sm font-semibold mb-2 bg-muted p-2 rounded-t-md border border-b-0">
                Novos Dados
              </h4>
              <ScrollArea className="flex-1 border rounded-b-md p-4 bg-muted/30">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {selectedLog?.dados_novos ? (
                    JSON.stringify(selectedLog.dados_novos, null, 2)
                  ) : (
                    <span className="text-muted-foreground italic">Nenhum dado novo (DELETE)</span>
                  )}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
