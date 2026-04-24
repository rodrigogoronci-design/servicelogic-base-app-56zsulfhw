import pb from '@/lib/pocketbase/client'
import { Comentario } from '@/types'

export const getComentariosPorChamado = async (chamadoId: string) => {
  return await pb.collection('comentarios').getFullList<Comentario>({
    filter: `chamado_id = "${chamadoId}"`,
    sort: '-created',
    expand: 'usuario_id',
  })
}

export const criarComentario = async (chamadoId: string, texto: string, usuarioId: string) => {
  return await pb.collection('comentarios').create<Comentario>({
    chamado_id: chamadoId,
    usuario_id: usuarioId,
    texto,
  })
}
