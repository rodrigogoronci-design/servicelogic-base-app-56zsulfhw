import pb from '@/lib/pocketbase/client'
import { LogAuditoria } from '@/types'

export const getLogsPorChamado = async (chamadoId: string) => {
  return await pb.collection('logs_auditoria').getFullList<LogAuditoria>({
    filter: `tabela = 'chamados' && (dados_novos.id = "${chamadoId}" || dados_anteriores.id = "${chamadoId}")`,
    sort: '-created',
    expand: 'usuario_id',
  })
}
