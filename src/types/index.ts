export type Perfil = 'Atendente' | 'Cliente'

export interface Usuario {
  id: string
  email: string
  nome: string
  perfil: Perfil
  ativo: boolean
}

export interface Chamado {
  id: string
  numero: string
  cliente_id: string
  status: 'Aberto' | 'Pendente' | 'Resolvido' | 'Fechado'
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  titulo: string
  descricao: string
  data_criacao: string
  tempo_decorrido: string
}

export interface Cliente {
  id: string
  cnpj: string
  nome: string
  email: string
  telefone: string
  contato_principal: string
}
