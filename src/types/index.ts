export type Perfil = 'Atendente' | 'Cliente'

export interface Usuario {
  id: string
  email: string
  name: string
  perfil: Perfil
  ativo: boolean
  created: string
  updated: string
}

export interface Chamado {
  id: string
  numero: string
  cliente_id: string
  atendente_id: string
  status: 'Aberto' | 'Aguardando Cliente' | 'Em Análise' | 'Fechado'
  prioridade: 'Baixa' | 'Média' | 'Alta'
  titulo: string
  descricao: string
  data_criacao: string
  data_conclusao?: string
  tempo_decorrido: number
  jira_issue_id?: string
  created: string
  updated: string
  expand?: {
    cliente_id?: Cliente
    atendente_id?: Usuario
  }
}

export interface Comentario {
  id: string
  chamado_id: string
  usuario_id: string
  texto: string
  created: string
  updated: string
  expand?: {
    usuario_id?: Usuario
  }
}

export interface LogAuditoria {
  id: string
  usuario_id: string
  tabela: string
  acao: string
  dados_anteriores: any
  dados_novos: any
  created: string
  updated: string
  expand?: {
    usuario_id?: Usuario
  }
}

export interface Cliente {
  id: string
  cnpj: string
  nome: string
  email: string
  telefone: string
  contato_principal: string
  usuario_id: string
  created: string
  updated: string
}

export interface Validacao {
  id: string
  chamado_id: string
  cliente_id: string
  status: 'Pendente' | 'Validado' | 'Rejeitado'
  resposta: 'Validei' | 'Não funcionou'
  comentario: string
  data_validacao: string
  token?: string
  data_expiracao?: string
  created: string
  updated: string
}

export interface Notificacao {
  id: string
  usuario_id: string
  tipo: 'WhatsApp' | 'Email' | 'Sistema'
  titulo: string
  mensagem: string
  lido: boolean
  created: string
  updated: string
}
