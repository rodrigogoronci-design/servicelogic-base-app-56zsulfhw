routerAdd('POST', '/backend/v1/sync/jira', (e) => {
  const sig = e.request.header.get('X-Atlassian-Signature')
  const secret = $secrets.get('JIRA_WEBHOOK_SECRET')

  if (secret && !sig) {
    return e.unauthorizedError('Invalid signature')
  }

  const body = e.requestInfo().body || {}
  const issue_id = body.issue_id || (body.issue && body.issue.id)
  let status = body.status

  if (!status && body.issue && body.issue.fields && body.issue.fields.status) {
    status = body.issue.fields.status.name
  }

  if (!issue_id || !status) {
    return e.badRequestError('Missing issue_id or status')
  }

  if (status !== 'Done') {
    return e.json(200, { message: 'Ignored status' })
  }

  let chamado
  try {
    chamado = $app.findFirstRecordByData('chamados', 'jira_issue_id', issue_id)
  } catch (_) {
    return e.notFoundError('Chamado não encontrado para este issue_id.')
  }

  const delays = [2000, 4000, 8000]
  let success = false
  let lastErr = null

  for (let i = 0; i <= delays.length; i++) {
    try {
      $app.runInTransaction((txApp) => {
        chamado.set('status', 'Aguardando Cliente')
        txApp.save(chamado)

        const valCol = txApp.findCollectionByNameOrId('validacoes')
        const validacao = new Record(valCol)
        validacao.set('chamado_id', chamado.id)
        validacao.set('cliente_id', chamado.get('cliente_id'))
        validacao.set('status', 'Pendente')
        validacao.set('token', $security.randomString(32))

        const d = new Date()
        d.setDate(d.getDate() + 7)
        validacao.set('data_expiracao', d.toISOString().replace('T', ' '))

        txApp.save(validacao)
      })
      success = true
      break
    } catch (err) {
      lastErr = err
      if (i < delays.length) {
        const end = Date.now() + delays[i]
        while (Date.now() < end) {}
      }
    }
  }

  if (!success) {
    return e.internalServerError('Falha ao atualizar banco de dados após retentativas: ' + lastErr)
  }

  const types = ['WhatsApp', 'Email', 'Sistema']
  for (const t of types) {
    try {
      $http.send({
        url: 'http://127.0.0.1:8090/backend/v1/notifications/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamado_id: chamado.id, tipo: t }),
        timeout: 10,
      })
    } catch (err) {
      $app.logger().error('Failed to trigger internal notification', 'error', err)
    }
  }

  return e.json(200, { message: 'Sincronizado com sucesso' })
})
