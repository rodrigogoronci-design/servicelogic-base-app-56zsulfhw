import pb from '@/lib/pocketbase/client'

export const getMovideskJiraConfig = () =>
  pb.send('/backend/v1/config/movidesk-jira', { method: 'GET' })

export const saveMovideskJiraConfig = (data: any) =>
  pb.send('/backend/v1/config/movidesk-jira', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const salvarCredenciaisIntegracao = (data: {
  tipo: 'movidesk' | 'jira'
  url: string
  token: string
}) =>
  pb.send('/backend/v1/salvar-credenciais-integracao', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const testarConexaoIntegracao = (data: {
  tipo: 'movidesk' | 'jira'
  url: string
  token: string
}) =>
  pb.send('/backend/v1/testar-conexao-integracao', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
