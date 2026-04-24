migrate(
  (app) => {
    const clientes = new Collection({
      name: 'clientes',
      type: 'base',
      listRule: "@request.auth.perfil = 'Atendente' || usuario_id = @request.auth.id",
      viewRule: "@request.auth.perfil = 'Atendente' || usuario_id = @request.auth.id",
      createRule: "@request.auth.perfil = 'Atendente'",
      updateRule: "@request.auth.perfil = 'Atendente'",
      deleteRule: "@request.auth.perfil = 'Atendente'",
      fields: [
        { name: 'cnpj', type: 'text', required: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'telefone', type: 'text' },
        { name: 'contato_principal', type: 'text' },
        { name: 'usuario_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_clientes_cnpj ON clientes (cnpj)'],
    })
    app.save(clientes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('clientes'))
  },
)
