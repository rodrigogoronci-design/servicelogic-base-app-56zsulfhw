import pb from '@/lib/pocketbase/client'
import { ConfiguracaoZAPI, RespostaTesteConexao } from '@/types'

export const getWhatsAppConfig = async (): Promise<ConfiguracaoZAPI> => {
  return await pb.send('/backend/v1/integrations/whatsapp', { method: 'GET' })
}

export const saveWhatsAppConfig = async (data: ConfiguracaoZAPI) => {
  return await pb.send('/backend/v1/integrations/whatsapp', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const testWhatsAppConnection = async (
  data: ConfiguracaoZAPI,
): Promise<RespostaTesteConexao> => {
  return await pb.send('/backend/v1/integrations/whatsapp/test', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
