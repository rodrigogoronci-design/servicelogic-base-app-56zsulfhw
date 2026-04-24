import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Chamado, Comentario } from '@/types'
import { getComentariosPorChamado } from '@/services/comentarios'
import { MessageSquare, Clock, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientTicketDetailsSheetProps {
  chamado: Chamado | null
  isOpen: boolean
  onClose: () => void
}

export function ClientTicketDetailsSheet({
  chamado,
  isOpen,
  onClose,
}: ClientTicketDetailsSheetProps) {
  const navigate = useNavigate()
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    if (isOpen && chamado) {
      loadComments(chamado.id)
    }
  }, [isOpen, chamado])

  const loadComments = async (id: string) => {
    setIsLoadingComments(true)
    try {
      const data = await getComentariosPorChamado(id)
      setComentarios(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingComments(false)
    }
  }

  if (!chamado) return null

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col p-0 bg-background overflow-hidden border-l">
        <SheetHeader className="p-6 border-b bg-muted/10">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle className="text-xl font-bold flex items-center gap-3">
              <span className="text-muted-foreground">{chamado.numero}</span>
            </SheetTitle>
            <Badge
              variant="outline"
              className={cn('text-xs py-1 whitespace-nowrap', getStatusColor(chamado.status))}
            >
              {chamado.status}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Main Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                {chamado.titulo}
              </h3>
              <div className="bg-muted/30 rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed border">
                {chamado.descricao || 'Sem descrição fornecida.'}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl border">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" />
                  Prioridade
                </h4>
                <p className="font-semibold text-sm">{chamado.prioridade}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Data de Criação
                </h4>
                <p className="font-semibold text-sm">
                  {new Date(chamado.created).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="col-span-2">
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Última Atualização
                </h4>
                <p className="font-semibold text-sm">
                  {new Date(chamado.updated).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-6 pb-6">
              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                <MessageSquare className="size-4 text-muted-foreground" />
                Histórico de Comentários
              </h4>

              {isLoadingComments ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Carregando comentários...
                </div>
              ) : comentarios.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                  Nenhum comentário adicionado a este chamado.
                </div>
              ) : (
                <div className="space-y-5">
                  {comentarios.map((comentario) => (
                    <div key={comentario.id} className="flex gap-3">
                      <Avatar className="size-8 border shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {comentario.expand?.usuario_id?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold truncate">
                            {comentario.expand?.usuario_id?.name || 'Equipe de Suporte'}
                          </span>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(comentario.created).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-2xl rounded-tl-sm p-3.5 text-sm text-foreground/90 leading-relaxed">
                          {comentario.texto}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Action Footer */}
        {chamado.status === 'Aguardando Cliente' && (
          <div className="p-4 border-t bg-card shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-900/20 text-base"
              onClick={() => {
                onClose()
                navigate('/validacao')
              }}
            >
              Validar Solução
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
