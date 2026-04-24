routerAdd(
  'POST',
  '/backend/v1/config/movidesk-jira',
  (e) => {
    const body = e.requestInfo().body
    const authRecord = e.auth

    if (authRecord.getString('perfil') !== 'Atendente') {
      return e.forbiddenError('Apenas atendentes podem salvar estas configurações')
    }

    const { movidesk, jira } = body

    if (movidesk) {
      if (movidesk.url && !movidesk.url.startsWith('https://'))
        return e.badRequestError('Movidesk URL inválida')
      if (movidesk.token && !movidesk.token.includes('****') && movidesk.token.length < 30) {
        return e.badRequestError('Movidesk Token muito curto')
      }
    }

    if (jira) {
      if (jira.url && !jira.url.startsWith('https://'))
        return e.badRequestError('Jira URL inválida')
      if (jira.token && !jira.token.includes('****') && jira.token.length < 30) {
        return e.badRequestError('Jira Token muito curto')
      }
    }

    // Registra a alteração na trilha de auditoria
    try {
      const logsCollection = $app.findCollectionByNameOrId('logs_auditoria')
      const logRecord = new Record(logsCollection)
      logRecord.set('usuario_id', authRecord.id)
      logRecord.set('tabela', 'secrets')
      logRecord.set('acao', 'UPDATE')
      logRecord.set('dados_novos', {
        movideskUrl: movidesk?.url || '',
        movideskTokenAtualizado: movidesk?.token && !movidesk.token.includes('****') ? true : false,
        jiraUrl: jira?.url || '',
        jiraTokenAtualizado: jira?.token && !jira.token.includes('****') ? true : false,
      })
      $app.save(logRecord)
    } catch (err) {
      $app.logger().error('Erro ao salvar log de auditoria', err)
    }

    return e.json(200, { success: true, message: 'Configurações processadas com sucesso.' })
  },
  $apis.requireAuth(),
)
