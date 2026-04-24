routerAdd(
  'GET',
  '/backend/v1/config/movidesk-jira',
  (e) => {
    const maskToken = (token) => {
      if (!token) return ''
      if (token.length <= 10) return '****' + token.slice(-2)
      return '********************' + token.slice(-10)
    }

    const mUrl = $secrets.get('MOVIDESK_API_URL') || ''
    const mToken = $secrets.get('MOVIDESK_API_TOKEN') || ''
    const jUrl = $secrets.get('JIRA_INSTANCE_URL') || ''
    const jToken = $secrets.get('JIRA_API_TOKEN') || ''

    return e.json(200, {
      movidesk: { url: mUrl, token: maskToken(mToken) },
      jira: { url: jUrl, token: maskToken(jToken) },
    })
  },
  $apis.requireAuth(),
)
