routerAdd(
  'POST',
  '/backend/v1/testar-conexao-integracao',
  (e) => {
    const authRecord = e.auth

    if (!authRecord || authRecord.getString('perfil') !== 'Atendente') {
      return e.json(401, { error: 'Não autorizado' })
    }

    const body = e.requestInfo().body || {}

    const tipo = body.tipo
    const url = body.url
    const token = body.token

    if (tipo !== 'movidesk' && tipo !== 'jira') {
      return e.json(400, { error: "O campo 'tipo' deve ser 'movidesk' ou 'jira'" })
    }

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
      return e.json(400, { error: 'A URL deve começar com https://' })
    }

    if (!token || typeof token !== 'string' || token.length < 30) {
      return e.json(400, { error: 'O token deve ter no mínimo 30 caracteres' })
    }

    try {
      const res = $http.send({
        url: url,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        timeout: 10,
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return e.json(200, {
          data: {
            mensagem: 'Conexão testada com sucesso!',
            tipo: tipo,
            timestamp: new Date().toISOString(),
          },
        })
      } else {
        let errorMsg = 'Erro desconhecido'
        try {
          if (res.json && res.json.message) errorMsg = res.json.message
          else if (res.json && res.json.error) errorMsg = res.json.error
          else errorMsg = `Status ${res.statusCode}`
        } catch (_) {}
        return e.json(503, {
          error: `Falha ao conectar com API (${errorMsg})`,
        })
      }
    } catch (err) {
      $app.logger().error('Erro no teste de conexao: ', 'err', err.message || String(err))
      return e.json(500, {
        error: 'Erro interno do servidor',
      })
    }
  },
  $apis.requireAuth(),
  $apis.skipSuccessActivityLog(),
)
