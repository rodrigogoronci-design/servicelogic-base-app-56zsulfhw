import pb from '@/lib/pocketbase/client'
import { Notificacao } from '@/types'

export const getNotificacoesUsuario = async (userId: string) => {
  return await pb.collection('notificacoes').getList<Notificacao>(1, 10, {
    filter: `usuario_id = "${userId}"`,
    sort: '-created',
  })
}

export const marcarComoLida = async (id: string) => {
  return await pb.collection('notificacoes').update(id, { lido: true })
}

export const marcarTodasComoLidas = async (userId: string) => {
  const naoLidas = await pb.collection('notificacoes').getFullList({
    filter: `usuario_id = "${userId}" && lido = false`,
  })
  if (naoLidas.length === 0) return

  const promises = naoLidas.map((n) => pb.collection('notificacoes').update(n.id, { lido: true }))
  await Promise.all(promises)
}

export const limparTodas = async (userId: string) => {
  const todas = await pb.collection('notificacoes').getFullList({
    filter: `usuario_id = "${userId}"`,
  })
  if (todas.length === 0) return

  const promises = todas.map((n) => pb.collection('notificacoes').delete(n.id))
  await Promise.all(promises)
}
