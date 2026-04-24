// Testar conexão com Z-API WhatsApp
routerAdd(
  'POST',
  '/backend/v1/integrations/whatsapp/test',
  (e) => {
    if (e.auth?.getString('perfil') !== 'Atendente') {
      return e.forbiddenError('Acesso negado')
    }

    const body = e.requestInfo().body || {}
    const { url, token, numeroTelefone } = body

    if (!url || !token || !numeroTelefone) {
      return e.badRequestError('URL, Token e Telefone são obrigatórios para o teste')
    }

    let finalToken = token
    // Se o token vier mascarado (foi apenas visualizado e não alterado no frontend),
    // tentamos resgatá-lo do vault de secrets original para testar
    if (token.includes('*')) {
      finalToken = $secrets.get('ZAPI_TOKEN') || token
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

    const res = $http.send({
      url: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + finalToken,
      },
      body: JSON.stringify(payload),
      timeout: 15,
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return e.json(200, {
        sucesso: true,
        mensagem: 'Conexão testada com sucesso!',
        timestamp: new Date().toISOString(),
      })
    } else {
      $app.logger().error('Falha ao testar Z-API', 'status', res.statusCode, 'body', res.raw)
      return e.json(400, {
        sucesso: false,
        mensagem: 'Falha ao testar conexão. HTTP ' + res.statusCode,
        timestamp: new Date().toISOString(),
      })
    }
  },
  $apis.requireAuth(),
)
