import pb from '@/lib/pocketbase/client'
import { LogAuditoria } from '@/types'

export const getLogsPorChamado = async (chamadoId: string) => {
  return await pb.collection('logs_auditoria').getFullList<LogAuditoria>({
    filter: `tabela = 'chamados' && (dados_novos.id = "${chamadoId}" || dados_anteriores.id = "${chamadoId}")`,
    sort: '-created',
    expand: 'usuario_id',
  })
}

export const getTodosLogs = async (
  page: number = 1,
  perPage: number = 20,
  tabela?: string,
  acao?: string,
) => {
  const filters = []
  if (tabela && tabela !== 'todas') filters.push(`tabela = "${tabela}"`)
  if (acao && acao !== 'todas') filters.push(`acao = "${acao}"`)

  const filterStr = filters.join(' && ')

  return await pb.collection('logs_auditoria').getList<LogAuditoria>(page, perPage, {
    filter: filterStr,
    sort: '-created',
    expand: 'usuario_id',
  })
}

export const getAllLogsForExport = async (tabela?: string, acao?: string) => {
  const filters = []
  if (tabela && tabela !== 'todas') filters.push(`tabela = "${tabela}"`)
  if (acao && acao !== 'todas') filters.push(`acao = "${acao}"`)

  const filterStr = filters.join(' && ')

  return await pb.collection('logs_auditoria').getFullList<LogAuditoria>({
    filter: filterStr,
    sort: '-created',
    expand: 'usuario_id',
  })
}
