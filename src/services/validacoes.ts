import pb from '@/lib/pocketbase/client'
import { Validacao } from '@/types'

export const getValidacoes = async () => {
  return await pb.collection('validacoes').getFullList<Validacao>({
    sort: '-created',
  })
}
