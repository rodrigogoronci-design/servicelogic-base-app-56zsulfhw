migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const seedUser = (email, name, perfil) => {
      try {
        return app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', name)
        record.set('perfil', perfil)
        record.set('ativo', true)
        app.save(record)
        return record
      }
    }

    const atendente1 = seedUser('ana@servicelogic.com.br', 'Ana', 'Atendente')
    const atendente2 = seedUser('carlos@servicelogic.com.br', 'Carlos', 'Atendente')
    const atendente3 = seedUser('mariana@servicelogic.com.br', 'Mariana', 'Atendente')
    const clienteUser = seedUser('cliente@empresa.com.br', 'Cliente Teste', 'Cliente')

    const clientesCol = app.findCollectionByNameOrId('clientes')

    const seedCliente = (cnpj, nome, email, user_id) => {
      try {
        return app.findFirstRecordByData('clientes', 'cnpj', cnpj)
      } catch (_) {
        const record = new Record(clientesCol)
        record.set('cnpj', cnpj)
        record.set('nome', nome)
        record.set('email', email)
        if (user_id) {
          record.set('usuario_id', user_id)
        }
        app.save(record)
        return record
      }
    }

    const clienteA = seedCliente(
      '12.345.678/0001-90',
      'Empresa A',
      'contato@empresaa.com.br',
      clienteUser.id,
    )
    const clienteB = seedCliente(
      '98.765.432/0001-10',
      'Empresa B',
      'contato@empresab.com.br',
      clienteUser.id,
    )

    const chamadosCol = app.findCollectionByNameOrId('chamados')

    const seedChamado = (numero, cliente_id, atendente_id, status, prioridade, titulo) => {
      try {
        app.findFirstRecordByData('chamados', 'numero', numero)
      } catch (_) {
        const record = new Record(chamadosCol)
        record.set('numero', numero)
        record.set('cliente_id', cliente_id)
        record.set('atendente_id', atendente_id)
        record.set('status', status)
        record.set('prioridade', prioridade)
        record.set('titulo', titulo)
        record.set('descricao', 'Descrição detalhada do chamado ' + numero)
        record.set('data_criacao', new Date().toISOString())
        record.set('tempo_decorrido', Math.floor(Math.random() * 10) + 1)
        app.save(record)
      }
    }

    seedChamado('CH-1001', clienteA.id, atendente1.id, 'Aberto', 'Alta', 'Sistema fora do ar')
    seedChamado(
      'CH-1002',
      clienteA.id,
      atendente2.id,
      'Aberto',
      'Média',
      'Dúvida sobre faturamento',
    )
    seedChamado('CH-1003', clienteB.id, atendente3.id, 'Aberto', 'Baixa', 'Alteração de endereço')
    seedChamado('CH-1004', clienteB.id, atendente1.id, 'Aberto', 'Média', 'Novo usuário no sistema')
    seedChamado('CH-1005', clienteA.id, atendente2.id, 'Aberto', 'Alta', 'Erro ao emitir NFe')

    seedChamado(
      'CH-1006',
      clienteA.id,
      atendente3.id,
      'Aguardando Cliente',
      'Média',
      'Validação de layout',
    )
    seedChamado(
      'CH-1007',
      clienteB.id,
      atendente1.id,
      'Aguardando Cliente',
      'Alta',
      'Aprovação de orçamento',
    )
    seedChamado(
      'CH-1008',
      clienteA.id,
      atendente2.id,
      'Aguardando Cliente',
      'Baixa',
      'Confirmação de dados',
    )

    seedChamado('CH-1009', clienteB.id, atendente3.id, 'Fechado', 'Baixa', 'Dúvida respondida')
    seedChamado('CH-1010', clienteA.id, atendente1.id, 'Fechado', 'Média', 'Treinamento realizado')
  },
  (app) => {
    // Empty down for seeds
  },
)
