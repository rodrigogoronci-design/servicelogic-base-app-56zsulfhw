routerAdd('POST', '/backend/v1/validacoes/{id}/responder', (e) => {
  const id = e.request.pathValue('id')
  const body = e.requestInfo().body || {}
  const resposta = body.resposta
  const comentario = body.comentario || ''

  if (resposta !== 'Validei' && resposta !== 'Não funcionou') {
    return e.badRequestError('Resposta inválida.')
  }

  if (resposta === 'Não funcionou' && !comentario.trim()) {
    return e.badRequestError('Comentário é obrigatório.')
  }

  let validacao
  try {
    validacao = $app.findRecordById('validacoes', id)
  } catch (_) {
    return e.notFoundError('Validação não encontrada.')
  }

  if (validacao.getString('status') !== 'Pendente') {
    return e.badRequestError('Validação já processada.')
  }

  const createdStr = validacao.getString('created')
  const createdDate = new Date(createdStr)
  const now = new Date()
  const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24)
  if (diffDays > 7) {
    return e.badRequestError('Link expirado.')
  }

  let chamado
  try {
    chamado = $app.findRecordById('chamados', validacao.getString('chamado_id'))
  } catch (_) {
    return e.notFoundError('Chamado não encontrado.')
  }

  $app.runInTransaction((txApp) => {
    validacao.set('status', resposta === 'Validei' ? 'Validado' : 'Rejeitado')
    validacao.set('resposta', resposta)
    validacao.set('comentario', comentario)
    validacao.set('data_validacao', new Date().toISOString())
    txApp.save(validacao)

    const statusAnterior = chamado.getString('status')
    const novoStatus = resposta === 'Validei' ? 'Fechado' : 'Em Análise'
    chamado.set('status', novoStatus)
    txApp.save(chamado)

    const log = new Record(txApp.findCollectionByNameOrId('logs_auditoria'))
    let userId = ''
    if (e.auth) {
      userId = e.auth.id
    } else {
      try {
        const cliente = txApp.findRecordById('clientes', chamado.getString('cliente_id'))
        userId = cliente.getString('usuario_id')
      } catch (_) {}
    }

    if (userId) {
      log.set('usuario_id', userId)
    }
    log.set('tabela', 'chamados')
    log.set('acao', 'update_validacao_externa')
    log.set('dados_anteriores', { status: statusAnterior })
    log.set('dados_novos', {
      status: novoStatus,
      validacao_id: id,
      resposta,
      ip: e.request.remoteAddr,
    })
    txApp.save(log)

    if (resposta === 'Não funcionou') {
      const notif = new Record(txApp.findCollectionByNameOrId('notificacoes'))
      notif.set('usuario_id', chamado.getString('atendente_id'))
      notif.set('tipo', 'Sistema')
      notif.set('titulo', `Chamado ${chamado.getString('numero')} rejeitado`)
      notif.set('mensagem', `O cliente informou que a solução não funcionou: ${comentario}`)
      notif.set('lido', false)
      txApp.save(notif)
    }
  })

  return e.json(200, { success: true })
})
