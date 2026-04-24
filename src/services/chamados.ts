import pb from '@/lib/pocketbase/client'
import { Chamado } from '@/types'

export const getChamados = async () => {
  return await pb.collection('chamados').getFullList<Chamado>({
    sort: '-created',
  })
}
