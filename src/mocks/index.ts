import { Usuario, Chamado, Cliente } from '@/types'

export const MOCK_USERS: Usuario[] = [
  {
    id: '1',
    email: 'atendente@servicelogic.com',
    nome: 'Carlos Silva',
    perfil: 'Atendente',
    ativo: true,
  },
  {
    id: '2',
    email: 'cliente@empresa.com',
    nome: 'Ana Souza',
    perfil: 'Cliente',
    ativo: true,
  },
]

export const MOCK_CLIENTES: Cliente[] = [
  {
    id: '2',
    cnpj: '12.345.678/0001-90',
    nome: 'Empresa Alpha Ltda',
    email: 'contato@empresa.com',
    telefone: '(11) 99999-9999',
    contato_principal: 'Ana Souza',
  },
]

export const MOCK_CHAMADOS: Chamado[] = [
  {
    id: '101',
    numero: 'CH-1001',
    cliente_id: '2',
    status: 'Aberto',
    prioridade: 'Alta',
    titulo: 'Sistema ERP inacessível',
    descricao: 'Não conseguimos acessar o módulo financeiro desde as 8h.',
    data_criacao: '2023-11-01T08:00:00Z',
    tempo_decorrido: '2h 15m',
  },
  {
    id: '102',
    numero: 'CH-1002',
    cliente_id: '2',
    status: 'Pendente',
    prioridade: 'Média',
    titulo: 'Dúvida sobre emissão de notas',
    descricao: 'Como configuro o novo certificado digital?',
    data_criacao: '2023-11-01T09:30:00Z',
    tempo_decorrido: '45m',
  },
  {
    id: '103',
    numero: 'CH-1003',
    cliente_id: '3',
    status: 'Resolvido',
    prioridade: 'Baixa',
    titulo: 'Atualização de cadastro',
    descricao: 'Por favor, atualizem nosso endereço de faturamento.',
    data_criacao: '2023-10-30T14:00:00Z',
    tempo_decorrido: '2d 1h',
  },
]
