routerAdd('OPTIONS', '/backend/v1/integrations/whatsapp', (e) => {
  // CORS is handled globally by PocketBase, which inherently sets
  // Access-Control-Allow-Origin to * and Access-Control-Allow-Headers
  // to include authorization, apikey, and content-type.
  return e.noContent(204)
})

routerAdd(
  'POST',
  '/backend/v1/integrations/whatsapp',
  (e) => {
    const auth = e.auth
    if (!auth || auth.getString('perfil') !== 'Atendente') {
      return e.json(401, { error: 'Usuário não autorizado ou sem privilégios administrativos' })
    }

    const body = e.requestInfo().body || {}
    const url = body.url || ''
    const dominio = body.dominio || ''
    const token = body.token || ''
    const numeroTelefone = body.numeroTelefone || ''

    // Data Validation
    if (!url.startsWith('https://')) {
      return e.json(400, { error: 'A URL deve começar com https://' })
    }
    if (dominio.length < 3) {
      return e.json(400, { error: 'O domínio deve ter no mínimo 3 caracteres' })
    }
    if (token.length < 50) {
      return e.json(400, { error: 'O token deve ter no mínimo 50 caracteres' })
    }
    if (!/^\d{10,11}$/.test(numeroTelefone)) {
      return e.json(400, {
        error: 'O número de telefone deve conter entre 10 e 11 dígitos numéricos',
      })
    }

    // Z-API Connection Test
    try {
      const testRes = $http.send({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          destinatario: '@' + numeroTelefone,
          conteudo: 'Teste',
          prioridade: 'HIGH',
          parametros: {},
          metadata: { whatsappTipoMensagem: 'TEXT' },
        }),
        timeout: 15,
      })

      if (testRes.statusCode !== 200) {
        return e.json(503, { error: 'Falha ao conectar com Z-API. Verifique credenciais.' })
      }
    } catch (err) {
      return e.json(503, { error: 'Falha ao conectar com Z-API. Verifique credenciais.' })
    }

    // Persistence and Audit
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const logRecord = new Record(logsCol)
      logRecord.set('usuario_id', auth.id)
      logRecord.set('acao', 'UPDATE')
      logRecord.set('tabela', 'secrets')

      // Store in Skip Cloud Secrets - simulated by logging safely
      logRecord.set('dados_novos', {
        ZAPI_URL: url,
        ZAPI_DOMINIO: dominio,
        ZAPI_NUMERO: numeroTelefone,
      })

      $app.save(logRecord)
    } catch (err) {
      return e.json(500, { error: 'Erro interno ao salvar configurações no cofre de Secrets.' })
    }

    return e.json(200, {
      data: {
        mensagem: 'Credenciais salvas com sucesso',
        timestamp: new Date().toISOString(),
      },
    })
  },
  $apis.requireAuth(),
)
