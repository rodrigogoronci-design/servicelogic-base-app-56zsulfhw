import { useEffect, useState, useCallback, useRef } from 'react'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { TicketsTable } from '@/components/dashboard/TicketsTable'
import { TicketFilters } from '@/components/dashboard/TicketFilters'
import { TicketDetailsSheet } from '@/components/dashboard/TicketDetailsSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { getChamadosPaginated, getChamados } from '@/services/chamados'
import { Chamado } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { useDebounce } from '@/hooks/use-debounce'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Stats
  const [allChamados, setAllChamados] = useState<Chamado[]>([])

  // Pagination & Data
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [daysFilter, setDaysFilter] = useState(30)

  // Sort
  const [sortField, setSortField] = useState('created')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Sheet
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const loaderRef = useRef<HTMLDivElement>(null)

  const buildFilter = useCallback(() => {
    const conditions = []
    if (debouncedSearch) {
      conditions.push(`(numero ~ "${debouncedSearch}" || cliente_id.nome ~ "${debouncedSearch}")`)
    }
    if (statusFilter !== 'all') {
      conditions.push(`status = "${statusFilter}"`)
    }
    if (priorityFilter !== 'all') {
      conditions.push(`prioridade = "${priorityFilter}"`)
    }
    if (daysFilter < 30) {
      const date = new Date()
      date.setDate(date.getDate() - daysFilter)
      conditions.push(`created >= "${date.toISOString().replace('T', ' ')}"`)
    }
    return conditions.join(' && ')
  }, [debouncedSearch, statusFilter, priorityFilter, daysFilter])

  const loadAllForStats = async () => {
    try {
      const data = await getChamados()
      setAllChamados(data)
    } catch (e) {
      console.error(e)
    }
  }

  const loadData = async (resetPage: boolean = false) => {
    try {
      setError(false)
      if (resetPage) {
        setIsLoading(true)
        setPage(1)
      }

      const currentPage = resetPage ? 1 : page
      const sortStr = `${sortDirection === 'desc' ? '-' : ''}${sortField}`
      const filterStr = buildFilter()

      const result = await getChamadosPaginated(currentPage, 20, sortStr, filterStr)

      if (resetPage) {
        setChamados(result.items)
      } else {
        setChamados((prev) => {
          // avoid duplicates when realtime triggers while paginating
          const newItems = result.items.filter((item) => !prev.some((p) => p.id === item.id))
          return [...prev, ...newItems]
        })
      }

      setHasMore(result.page < result.totalPages)
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load & filter changes
  useEffect(() => {
    loadAllForStats()
  }, [])

  useEffect(() => {
    loadData(true)
  }, [debouncedSearch, statusFilter, priorityFilter, daysFilter, sortField, sortDirection])

  // Pagination observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 1.0 },
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading])

  // Load next page
  useEffect(() => {
    if (page > 1) loadData()
  }, [page])

  useRealtime('chamados', () => {
    loadData(true)
    loadAllForStats()
    if (selectedChamado) {
      // Refresh selected chamado if open
      setChamados((prev) => {
        const updated = prev.find((p) => p.id === selectedChamado.id)
        if (updated) setSelectedChamado(updated)
        return prev
      })
    }
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleRowClick = (chamado: Chamado) => {
    setSelectedChamado(chamado)
    setIsSheetOpen(true)
  }

  if (isLoading && page === 1) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4 mt-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error && chamados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-background border-dashed mt-6">
        <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Erro ao carregar chamados</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-4">
          Ocorreu um problema ao conectar com o servidor. Tente novamente.
        </p>
        <Button onClick={() => loadData(true)} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h2>
        <p className="text-muted-foreground">Acompanhe os indicadores e chamados recentes.</p>
      </div>

      <MetricsCards chamados={allChamados.length > 0 ? allChamados : chamados} />

      <div className="pt-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">Lista de Chamados</h3>
        </div>

        <TicketFilters
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
          priority={priorityFilter}
          setPriority={setPriorityFilter}
          days={daysFilter}
          setDays={setDaysFilter}
        />

        <div className="min-h-[400px]">
          <TicketsTable
            chamados={chamados}
            onRowClick={handleRowClick}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {hasMore && (
            <div ref={loaderRef} className="py-8 flex justify-center w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>

      <TicketDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        chamado={selectedChamado}
        onUpdate={() => loadData(true)}
      />
    </div>
  )
}
