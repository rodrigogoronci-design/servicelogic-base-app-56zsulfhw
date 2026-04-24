import { useEffect, useState } from 'react'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { TicketsTable } from '@/components/dashboard/TicketsTable'
import { Skeleton } from '@/components/ui/skeleton'
import { getChamados } from '@/services/chamados'
import { Chamado } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'

export default function Dashboard() {
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

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h2>
        <p className="text-muted-foreground">Acompanhe os indicadores e chamados recentes.</p>
      </div>

      <MetricsCards chamados={chamados} />

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold tracking-tight">Chamados Recentes</h3>
        </div>
        <TicketsTable chamados={chamados} />
      </div>
    </div>
  )
}
