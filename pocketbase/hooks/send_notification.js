routerAdd('POST', '/backend/v1/notifications/send', (e) => {
  const body = e.requestInfo().body || {}

  if (!body.chamado_id || !body.tipo) {
    return e.badRequestError('Missing chamado_id or tipo')
  }

  let chamado
  try {
    chamado = $app.findRecordById('chamados', body.chamado_id)
  } catch (_) {
    return e.notFoundError('Chamado não encontrado')
  }

  let cliente
  try {
    cliente = $app.findRecordById('clientes', chamado.get('cliente_id'))
  } catch (_) {
    return e.notFoundError('Cliente não encontrado')
  }

  let validacao
  try {
    validacao = $app.findFirstRecordByData('validacoes', 'chamado_id', chamado.id)
  } catch (_) {
    return e.notFoundError('Validação não encontrada')
  }

  const token = validacao.getString('token')
  if (!token) return e.badRequestError('Token não gerado para este chamado')

  const link =
    'https://servicelogic-base-app-345b6.goskip.app/validacao/' + chamado.id + '/' + token
  const tipo = body.tipo

  const delays = [2000, 4000, 8000]
  let success = false
  let lastErr = null

  for (let i = 0; i <= delays.length; i++) {
    try {
      if (tipo === 'WhatsApp') {
        const zapiToken = $secrets.get('ZAPI_TOKEN')
        if (zapiToken && cliente.getString('telefone')) {
          const msg = `Olá ${cliente.getString('nome')}! Sua solução está pronta. Clique aqui para validar: ${link}`
          const res = $http.send({
            url: 'https://api.z-api.io/instances/YOUR_INSTANCE/token/' + zapiToken + '/send-text',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: cliente.getString('telefone'), message: msg }),
            timeout: 5,
          })
          if (res.statusCode >= 400 && res.statusCode !== 404) {
            throw new Error('Z-API request failed with status: ' + res.statusCode)
          }
        }
      } else if (tipo === 'Email') {
        const smtpHost = $secrets.get('SMTP_HOST')
        if (smtpHost && cliente.getString('email')) {
          $app
            .logger()
            .info(
              'Simulando envio de email via provedor',
              'to',
              cliente.getString('email'),
              'link',
              link,
            )
        }
      } else if (tipo === 'Sistema') {
        const notifCol = $app.findCollectionByNameOrId('notificacoes')
        const notif = new Record(notifCol)
        notif.set('usuario_id', cliente.get('usuario_id'))
        notif.set('tipo', 'Sistema')
        notif.set('titulo', 'Solução entregue - Chamado #' + chamado.getString('numero'))
        notif.set('mensagem', 'Sua solução está pronta. Clique aqui para validar: ' + link)
        notif.set('lido', false)
        $app.save(notif)
      }

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
    return e.internalServerError('Falha ao enviar notificação após retentativas: ' + lastErr)
  }

  try {
    const auditCol = $app.findCollectionByNameOrId('logs_auditoria')
    const audit = new Record(auditCol)
    audit.set('tabela', 'notificacoes')
    audit.set('acao', 'Envio de ' + tipo)
    audit.set('dados_novos', { chamado_id: chamado.id, status: 'Enviado', link })
    $app.save(audit)
  } catch (err) {
    $app.logger().error('Falha ao salvar log de auditoria', 'error', err)
  }

  return e.json(200, { success: true })
})
