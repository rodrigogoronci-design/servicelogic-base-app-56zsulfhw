import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { TicketsTable } from '@/components/dashboard/TicketsTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getChamados } from '@/services/chamados'
import { Chamado } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'

export default function Portal() {
  const [isLoading, setIsLoading] = useState(true)
  const [chamados, setChamados] = useState<Chamado[]>([])

  const loadData = async () => {
    try {
      const data = await getChamados()
      setChamados(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('chamados', () => {
    loadData()
  })

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Meus Chamados</h1>
          <p className="text-muted-foreground">Acompanhe o andamento das suas solicitações.</p>
        </div>
        <Button size="lg" className="h-11 shadow-sm shrink-0">
          <Plus className="mr-2 size-5" />
          Novo Chamado
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-xl" />
      ) : (
        <TicketsTable chamados={chamados} />
      )}
    </div>
  )
}
