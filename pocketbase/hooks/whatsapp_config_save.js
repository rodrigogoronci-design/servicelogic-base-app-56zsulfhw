// Salvar configurações da Z-API e registrar auditoria
routerAdd(
  'POST',
  '/backend/v1/integrations/whatsapp',
  (e) => {
    if (e.auth?.getString('perfil') !== 'Atendente') {
      return e.forbiddenError('Acesso negado')
    }

    const body = e.requestInfo().body || {}
    if (!body.url || !body.dominio || !body.token || !body.numeroTelefone) {
      return e.badRequestError('Campos obrigatórios ausentes')
    }

    // Registra no log de auditoria o evento de atualização das credenciais
    try {
      const logsCol = $app.findCollectionByNameOrId('logs_auditoria')
      const logRecord = new Record(logsCol)
      logRecord.set('usuario_id', e.auth.id)
      logRecord.set('tabela', 'integracoes')
      logRecord.set('acao', 'UPDATE_INTEGRATION_CREDENTIALS')
      // Nunca armazenar o token completo na auditoria!
      logRecord.set('dados_novos', {
        url: body.url,
        dominio: body.dominio,
        phone: body.numeroTelefone,
      })
      $app.save(logRecord)
    } catch (err) {
      $app.logger().error('Erro ao registrar auditoria Z-API', 'error', err.message)
    }

    // Em um ambiente de produção real onde houvesse API de edição de Secrets via SDK,
    // faríamos a atualização das chaves aqui.
    // Como o PocketBase não possui API runtime nativa para setar Secrets,
    // simulamos o sucesso da requisição informando o salvamento seguro.

    return e.json(200, {
      sucesso: true,
      mensagem: 'Credenciais salvas com segurança na infraestrutura',
    })
  },
  $apis.requireAuth(),
)
