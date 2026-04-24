import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface TicketFiltersProps {
  search: string
  setSearch: (v: string) => void
  status: string
  setStatus: (v: string) => void
  priority: string
  setPriority: (v: string) => void
  days: number
  setDays: (v: number) => void
}

export function TicketFilters({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  days,
  setDays,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card md:flex-row md:items-end shadow-sm">
      <div className="flex-1 space-y-2">
        <Label>Buscar Chamado</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nº ou Nome do Cliente..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 w-full md:w-[180px]">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Aberto">Aberto</SelectItem>
            <SelectItem value="Aguardando Cliente">Aguardando Cliente</SelectItem>
            <SelectItem value="Em Análise">Em Análise</SelectItem>
            <SelectItem value="Fechado">Fechado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 w-full md:w-[180px]">
        <Label>Prioridade</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 w-full md:w-[200px] pb-2">
        <div className="flex justify-between items-center">
          <Label>Tempo (dias)</Label>
          <span className="text-xs text-muted-foreground">Últimos {days} dias</span>
        </div>
        <Slider
          value={[days]}
          onValueChange={(v) => setDays(v[0])}
          max={30}
          min={1}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}
