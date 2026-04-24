import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Inbox, AlertCircle, RefreshCw } from 'lucide-react'
import { ClientTicketsList } from '@/components/portal/ClientTicketsList'
import { ClientTicketDetailsSheet } from '@/components/portal/ClientTicketDetailsSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getChamadosPortal } from '@/services/chamados'
import { Chamado } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { useDebounce } from '@/hooks/use-debounce'

export default function Portal() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState('all')

  const [chamados, setChamados] = useState<Chamado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setIsError(false)

      const filters = []
      if (debouncedSearch) {
        filters.push(`numero ~ "${debouncedSearch.replace(/"/g, '')}"`)
      }
      if (statusFilter && statusFilter !== 'all') {
        filters.push(`status = "${statusFilter}"`)
      }

      const data = await getChamadosPortal(filters.join(' && '))
      setChamados(data)
    } catch (e) {
      console.error(e)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [debouncedSearch, statusFilter])

  useRealtime('chamados', () => {
    loadData()
  })

  const handleValidate = (chamado: Chamado) => {
    navigate('/validacao')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Meus Chamados</h1>
        <p className="text-muted-foreground">
          Acompanhe o andamento e valide as soluções das suas solicitações.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do chamado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-background">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Aberto">Aberto</SelectItem>
            <SelectItem value="Aguardando Cliente">Aguardando Cliente</SelectItem>
            <SelectItem value="Em Análise">Em Análise</SelectItem>
            <SelectItem value="Fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background border-dashed text-destructive animate-fade-in-up">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="size-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Erro ao carregar seus chamados.</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Ocorreu um problema de comunicação com o servidor. Tente novamente.
          </p>
          <Button onClick={loadData} variant="outline" className="mt-6">
            <RefreshCw className="mr-2 size-4" />
            Tentar Novamente
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3 animate-fade-in-up">
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
          <Skeleton className="h-[72px] w-full rounded-xl" />
        </div>
      ) : chamados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border rounded-xl bg-background border-dashed animate-fade-in-up shadow-sm">
          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-5">
            <Inbox className="size-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Você não possui chamados abertos
          </h3>
          <p className="text-base text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
            Caso precise de ajuda, entre em contato com nossa equipe de suporte através do email{' '}
            <span className="font-medium text-foreground">suporte@servicelogic.com</span>
          </p>
        </div>
      ) : (
        <ClientTicketsList
          chamados={chamados}
          onRowClick={(chamado) => {
            setSelectedChamado(chamado)
            setIsDetailsOpen(true)
          }}
          onValidate={handleValidate}
        />
      )}

      <ClientTicketDetailsSheet
        chamado={selectedChamado}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  )
}
