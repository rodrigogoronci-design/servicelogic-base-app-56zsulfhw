// Obter configurações atuais da Z-API via Secrets (mascarado)
routerAdd(
  'GET',
  '/backend/v1/integrations/whatsapp',
  (e) => {
    if (e.auth?.getString('perfil') !== 'Atendente') {
      return e.forbiddenError('Acesso negado')
    }

    const url = $secrets.get('ZAPI_URL') || ''
    const domain = $secrets.get('ZAPI_DOMAIN') || ''
    const token = $secrets.get('ZAPI_TOKEN') || ''
    const phone = $secrets.get('ZAPI_TEST_PHONE') || ''

    let maskedToken = ''
    if (token.length > 10) {
      maskedToken = '*'.repeat(40) + token.slice(-10)
    } else if (token) {
      maskedToken = '****************************************'
    }

    return e.json(200, {
      url: url,
      dominio: domain,
      token: maskedToken,
      numeroTelefone: phone,
    })
  },
  $apis.requireAuth(),
)
