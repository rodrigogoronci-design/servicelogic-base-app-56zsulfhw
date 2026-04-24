routerAdd('GET', '/backend/v1/validacoes/{id}/detalhes', (e) => {
  const id = e.request.pathValue('id')
  let validacao
  try {
    validacao = $app.findRecordById('validacoes', id)
  } catch (_) {
    return e.notFoundError('Validação não encontrada.')
  }

  const createdStr = validacao.getString('created')
  const createdDate = new Date(createdStr)
  const now = new Date()
  const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24)
  if (diffDays > 7) {
    return e.badRequestError('Link expirado.')
  }

  let chamado
  try {
    chamado = $app.findRecordById('chamados', validacao.getString('chamado_id'))
  } catch (_) {
    return e.notFoundError('Chamado não encontrado.')
  }

  let cliente
  try {
    cliente = $app.findRecordById('clientes', chamado.getString('cliente_id'))
  } catch (_) {
    return e.notFoundError('Cliente não encontrado.')
  }

  return e.json(200, {
    validacao: {
      id: validacao.id,
      status: validacao.getString('status'),
      chamado_id: validacao.getString('chamado_id'),
    },
    chamado: {
      numero: chamado.getString('numero'),
      descricao: chamado.getString('descricao'),
      status: chamado.getString('status'),
    },
    cliente: {
      nome: cliente.getString('nome'),
    },
  })
})
