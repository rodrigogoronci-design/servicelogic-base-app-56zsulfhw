import pb from '@/lib/pocketbase/client'
import { Chamado } from '@/types'

export const getChamados = async () => {
  return await pb.collection('chamados').getFullList<Chamado>({
    sort: '-created',
    expand: 'cliente_id,atendente_id',
  })
}

export const getChamadosPaginated = async (
  page: number,
  perPage: number,
  sort: string = '-created',
  filter: string = '',
) => {
  return await pb.collection('chamados').getList<Chamado>(page, perPage, {
    sort,
    filter,
    expand: 'cliente_id,atendente_id',
  })
}

export const updateChamadoStatus = async (id: string, status: string) => {
  return await pb.collection('chamados').update<Chamado>(id, { status })
}

export const getChamadosPortal = async (filterStr?: string) => {
  return await pb.collection('chamados').getFullList<Chamado>({
    sort: '-created',
    filter: filterStr,
    expand: 'cliente_id,atendente_id',
  })
}
