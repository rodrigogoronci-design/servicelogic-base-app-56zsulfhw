routerAdd('OPTIONS', '/backend/v1/testar-conexao-zapi', (e) => {
  return e.noContent(204)
})

routerAdd(
  'POST',
  '/backend/v1/testar-conexao-zapi',
  (e) => {
    const auth = e.auth
    if (!auth) {
      return e.unauthorizedError('Não autorizado')
    }

    if (auth.getString('perfil') !== 'Atendente') {
      return e.unauthorizedError('Acesso negado. Apenas perfil Atendente permitido.')
    }

    const body = e.requestInfo().body || {}
    const { url, dominio, token, numeroTelefone } = body

    if (!url || !url.startsWith('https://')) {
      return e.badRequestError('URL inválida. Deve começar com https://')
    }
    if (!dominio || dominio.length < 3) {
      return e.badRequestError('Domínio deve ter no mínimo 3 caracteres.')
    }
    if (!token || token.length < 50) {
      return e.badRequestError('Token deve ter no mínimo 50 caracteres.')
    }
    if (!numeroTelefone || !/^\d{10,11}$/.test(numeroTelefone)) {
      return e.badRequestError(
        'Número de telefone inválido. Deve conter apenas números (10 a 11 dígitos).',
      )
    }

    const payload = {
      destinatario: numeroTelefone,
      conteudo: 'Teste de conexão Z-API - Servicelogic',
      prioridade: 'HIGH',
      parametros: {},
      metadata: {
        whatsappTipoMensagem: 'TEXT',
      },
    }

    try {
      const res = $http.send({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
        timeout: 10,
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return e.json(200, {
          data: {
            mensagem: 'Conexão testada com sucesso!',
            timestamp: new Date().toISOString(),
          },
        })
      }

      let errMsg = 'Falha ao testar conexão. HTTP ' + res.statusCode
      try {
        if (res.json) {
          errMsg = res.json.message || res.json.error || errMsg
        } else if (res.body) {
          const text = new TextDecoder().decode(res.body)
          if (text) errMsg = text.substring(0, 100)
        }
      } catch (_) {}

      return e.json(503, {
        code: 503,
        message: errMsg,
      })
    } catch (err) {
      return e.internalServerError('Erro interno: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
