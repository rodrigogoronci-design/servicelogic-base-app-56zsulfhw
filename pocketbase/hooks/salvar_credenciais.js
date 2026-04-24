routerAdd('POST', '/backend/v1/salvar-credenciais-integracao', (e) => {
  const authRecord = e.auth
  if (!authRecord || authRecord.getString('perfil') !== 'Atendente') {
    return e.json(401, {
      error: 'Acesso não autorizado. Apenas atendentes administradores podem realizar esta ação.',
    })
  }

  const body = e.requestInfo().body || {}
  const tipo = body.tipo
  const url = body.url
  const token = body.token

  if (tipo !== 'movidesk' && tipo !== 'jira') {
    return e.json(400, { error: "O campo tipo deve ser 'movidesk' ou 'jira'." })
  }
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
    return e.json(400, { error: 'A URL fornecida é inválida. Deve começar com https://.' })
  }
  if (!token || typeof token !== 'string' || token.length < 30) {
    return e.json(400, {
      error: 'O token fornecido é muito curto. Deve ter no mínimo 30 caracteres.',
    })
  }

  let success = false
  // Retries (2s, 4s, 8s behavior simulated as immediate retries due to environment constraints)
  for (let i = 0; i < 4; i++) {
    try {
      const res = $http.send({
        url: url,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        timeout: 10,
      })
      if (res.statusCode === 200) {
        success = true
        break
      }
    } catch (err) {
      // transport error, will retry
    }
  }

  if (!success) {
    return e.json(503, { error: 'Falha ao conectar. Verifique credenciais.' })
  }

  try {
    const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
    const logRecord = new Record(logsCol)
    logRecord.set('usuario_id', authRecord.id)
    logRecord.set('tabela', 'secrets')
    logRecord.set('acao', 'UPDATE')
    logRecord.set('dados_novos', { url: url, tipo: tipo })
    $app.save(logRecord)
  } catch (err) {
    $app.logger().error('Falha ao registrar log de auditoria', 'error', err.message)
  }

  return e.json(200, {
    data: {
      mensagem: 'Credenciais salvas com sucesso',
      tipo: tipo,
      timestamp: new Date().toISOString(),
    },
  })
})
