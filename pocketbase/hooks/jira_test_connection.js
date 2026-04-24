routerAdd(
  'POST',
  '/backend/v1/test/jira',
  (e) => {
    const body = e.requestInfo().body
    const { url, token } = body

    if (!url || !token) return e.badRequestError('URL e Token são obrigatórios')

    let finalToken = token
    if (finalToken.includes('****')) {
      const realToken = $secrets.get('JIRA_API_TOKEN')
      if (realToken && realToken.slice(-10) === finalToken.slice(-10)) {
        finalToken = realToken
      }
    }

    try {
      let testUrl = url
      if (testUrl.endsWith('/')) testUrl = testUrl.slice(0, -1)
      testUrl = testUrl + '/rest/api/3/serverInfo' // common unauthenticated or basic authenticated endpoint to test reachability

      const res = $http.send({
        url: testUrl,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + finalToken,
          Accept: 'application/json',
        },
        timeout: 10,
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return e.json(200, {
          sucesso: true,
          mensagem: 'Conexão com Jira bem sucedida!',
          timestamp: new Date().toISOString(),
        })
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        return e.json(400, {
          sucesso: false,
          mensagem: 'Falha de autenticação no Jira (Token inválido)',
          timestamp: new Date().toISOString(),
        })
      } else {
        return e.json(400, {
          sucesso: false,
          mensagem: 'Erro na conexão Jira: HTTP ' + res.statusCode,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err) {
      return e.json(400, {
        sucesso: false,
        mensagem: 'Erro de rede ao conectar à URL do Jira',
        timestamp: new Date().toISOString(),
      })
    }
  },
  $apis.requireAuth(),
)
