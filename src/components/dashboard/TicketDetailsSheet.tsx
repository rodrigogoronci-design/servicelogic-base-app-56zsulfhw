import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Chamado, Comentario, LogAuditoria } from '@/types'
import { getComentariosPorChamado, criarComentario } from '@/services/comentarios'
import { getLogsPorChamado } from '@/services/logs'
import { updateChamadoStatus } from '@/services/chamados'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Clock,
  Send,
  ExternalLink,
  Activity,
  MessageSquare,
  Info,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TicketDetailsSheetProps {
  chamado: Chamado | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function TicketDetailsSheet({
  chamado,
  isOpen,
  onClose,
  onUpdate,
}: TicketDetailsSheetProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('detalhes')
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [logs, setLogs] = useState<LogAuditoria[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isOpen && chamado) {
      setActiveTab('detalhes')
      loadComments()
      loadLogs()
    }
  }, [isOpen, chamado])

  const loadComments = async () => {
    if (!chamado) return
    setIsLoadingComments(true)
    try {
      const data = await getComentariosPorChamado(chamado.id)
      setComentarios(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const loadLogs = async () => {
    if (!chamado) return
    setIsLoadingLogs(true)
    try {
      const data = await getLogsPorChamado(chamado.id)
      setLogs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!chamado) return
    setIsUpdating(true)
    try {
      await updateChamadoStatus(chamado.id, newStatus)
      toast.success(`Status atualizado para ${newStatus}`)
      onUpdate()
      onClose()
    } catch (e) {
      toast.error('Erro ao atualizar status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!chamado || !newComment.trim() || !user) return
    try {
      await criarComentario(chamado.id, newComment, user.id)
      setNewComment('')
      loadComments()
      toast.success('Comentário adicionado')
    } catch (e) {
      toast.error('Erro ao adicionar comentário')
    }
  }

  if (!chamado) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Aguardando Cliente':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Fechado':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 bg-background overflow-hidden">
        <div className="p-6 border-b bg-card text-card-foreground shadow-sm z-10">
          <SheetHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-muted-foreground font-semibold">{chamado.numero}</span>
                <Badge
                  variant="outline"
                  className={cn('text-xs py-1', getStatusColor(chamado.status))}
                >
                  {chamado.status}
                </Badge>
              </SheetTitle>
            </div>
            <SheetDescription className="text-base font-medium text-foreground mt-4 line-clamp-2">
              {chamado.titulo}
            </SheetDescription>
          </SheetHeader>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 pt-2 border-b bg-muted/10">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
              <TabsTrigger
                value="detalhes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-semibold data-[state=active]:text-primary text-muted-foreground"
              >
                <Info className="size-4 mr-2" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                value="comentarios"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-semibold data-[state=active]:text-primary text-muted-foreground"
              >
                <MessageSquare className="size-4 mr-2" />
                Comentários
                {comentarios.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-full px-1.5 h-5 min-w-[20px] justify-center"
                  >
                    {comentarios.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="historico"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-semibold data-[state=active]:text-primary text-muted-foreground"
              >
                <Activity className="size-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-6">
            <TabsContent value="detalhes" className="m-0 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl border bg-card/50">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h4>
                  <p className="font-medium">
                    {chamado.expand?.cliente_id?.nome || 'Não informado'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Prioridade</h4>
                  <p className="font-medium">{chamado.prioridade}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Criado em</h4>
                  <p className="font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    {new Date(chamado.created).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Tempo Decorrido
                  </h4>
                  <p className="font-medium">
                    {chamado.tempo_decorrido ? `${chamado.tempo_decorrido}h` : '0h'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Info className="size-4 text-muted-foreground" />
                  Descrição do Chamado
                </h4>
                <div className="bg-muted/30 border border-muted p-5 rounded-xl text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {chamado.descricao || 'Sem descrição fornecida para este chamado.'}
                </div>
              </div>

              {chamado.jira_issue_id && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <ExternalLink className="size-4 text-muted-foreground" />
                    Integração Jira
                  </h4>
                  <div className="p-4 border rounded-xl bg-card">
                    <a
                      href={`https://jira.com/browse/${chamado.jira_issue_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                    >
                      {chamado.jira_issue_id}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="comentarios"
              className="m-0 flex flex-col min-h-[400px] h-full animate-fade-in"
            >
              <div className="flex-1 pb-6 space-y-5">
                {isLoadingComments ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p>Carregando comentários...</p>
                  </div>
                ) : comentarios.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed gap-3">
                    <MessageSquare className="size-8 opacity-20" />
                    <p>Nenhum comentário adicionado ainda.</p>
                  </div>
                ) : (
                  comentarios.map((comentario) => (
                    <div key={comentario.id} className="flex gap-4">
                      <Avatar className="size-9 border shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {comentario.expand?.usuario_id?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {comentario.expand?.usuario_id?.name || 'Usuário'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comentario.created).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 text-sm text-foreground/90 leading-relaxed">
                          {comentario.texto}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="historico" className="m-0 space-y-6 pb-6 animate-fade-in">
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p>Carregando histórico...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed gap-3">
                  <Activity className="size-8 opacity-20" />
                  <p>Nenhum registro no histórico encontrado.</p>
                </div>
              ) : (
                <div className="relative border-l-2 ml-4 pl-6 space-y-8 py-2 border-muted">
                  {logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[35px] bg-background border-2 border-muted p-1.5 rounded-full">
                        <Activity className="size-3.5 text-foreground" />
                      </div>
                      <div className="text-sm bg-card border rounded-xl p-4 shadow-sm">
                        <p className="font-semibold">{log.expand?.usuario_id?.name || 'Sistema'}</p>
                        <p className="mt-1 text-muted-foreground">{log.acao}</p>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                          <Clock className="size-3" />
                          {new Date(log.created).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>

          {activeTab === 'comentarios' && (
            <div className="p-4 bg-background border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
              <div className="flex gap-3 items-end max-w-3xl mx-auto">
                <Textarea
                  placeholder="Escreva um comentário interno..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] max-h-[200px] resize-none focus-visible:ring-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mb-1 size-10 rounded-full p-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Tabs>

        <div className="p-4 border-t bg-card/80 backdrop-blur-md flex items-center justify-end gap-3 z-20 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          {chamado.status !== 'Fechado' && chamado.status !== 'Aguardando Cliente' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('Aguardando Cliente')}
              disabled={isUpdating}
              className="text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 font-medium"
            >
              <HelpCircle className="size-4 mr-2" />
              Aguardar Cliente
            </Button>
          )}
          {chamado.status !== 'Fechado' && (
            <Button
              onClick={() => handleStatusChange('Fechado')}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md shadow-green-900/20"
            >
              <CheckCircle2 className="size-4 mr-2" />
              Fechar Chamado
            </Button>
          )}
          {chamado.status === 'Fechado' && (
            <p className="text-sm font-medium text-green-700 flex items-center gap-2 px-3">
              <CheckCircle2 className="size-4" /> Chamado Fechado
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
