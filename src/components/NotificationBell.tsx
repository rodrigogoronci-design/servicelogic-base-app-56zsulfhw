import { useEffect, useState } from 'react'
import { Bell, Check, CheckCircle2, Mail, MessageSquare, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Notificacao } from '@/types'
import {
  getNotificacoesUsuario,
  limparTodas,
  marcarComoLida,
  marcarTodasComoLidas,
} from '@/services/notificacoes'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const loadNotifications = async () => {
    if (!user) return
    try {
      const data = await getNotificacoesUsuario(user.id)
      setNotifications(data.items)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  useRealtime(
    'notificacoes',
    () => {
      loadNotifications()
    },
    !!user,
  )

  const unreadCount = notifications.filter((n) => !n.lido).length

  const handleMarkAllRead = async () => {
    if (!user) return
    await marcarTodasComoLidas(user.id)
    loadNotifications()
  }

  const handleClearAll = async () => {
    if (!user) return
    await limparTodas(user.id)
    loadNotifications()
  }

  const handleNotificationClick = async (notification: Notificacao) => {
    if (!notification.lido) {
      await marcarComoLida(notification.id)
      loadNotifications()
    }
    setOpen(false)
    navigate('/dashboard')
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'WhatsApp':
        return <MessageSquare className="size-4 text-green-500" />
      case 'Email':
        return <Mail className="size-4 text-blue-500" />
      default:
        return <Bell className="size-4 text-orange-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleMarkAllRead}
              title="Marcar todas como lidas"
              disabled={unreadCount === 0 || notifications.length === 0}
            >
              <Check className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleClearAll}
              title="Limpar todas"
              disabled={notifications.length === 0}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <CheckCircle2 className="size-12 text-muted mb-3" />
              <p className="text-sm font-medium">Você está em dia</p>
              <p className="text-xs">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div key={notif.id}>
                  <button
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3 relative',
                      !notif.lido && 'bg-primary/5',
                    )}
                  >
                    {!notif.lido && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                    )}
                    <div className="mt-1 shrink-0 p-2 bg-background rounded-full border shadow-sm">
                      {getIcon(notif.tipo)}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          !notif.lido && 'text-foreground',
                        )}
                      >
                        {notif.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.mensagem}</p>
                      <span className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notif.created), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </button>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
