migrate(
  (app) => {
    const chamados = app.findCollectionByNameOrId('chamados')
    const clientes = app.findCollectionByNameOrId('clientes')

    const validacoes = new Collection({
      name: 'validacoes',
      type: 'base',
      listRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      viewRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      deleteRule: "@request.auth.perfil = 'Atendente'",
      fields: [
        { name: 'chamado_id', type: 'relation', collectionId: chamados.id, maxSelect: 1 },
        { name: 'cliente_id', type: 'relation', collectionId: clientes.id, maxSelect: 1 },
        { name: 'status', type: 'select', values: ['Pendente', 'Validado', 'Rejeitado'] },
        { name: 'resposta', type: 'select', values: ['Validei', 'Não funcionou'] },
        { name: 'comentario', type: 'text' },
        { name: 'data_validacao', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(validacoes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('validacoes'))
  },
)
