migrate(
  (app) => {
    const notificacoes = new Collection({
      name: 'notificacoes',
      type: 'base',
      listRule: '@request.auth.id = usuario_id',
      viewRule: '@request.auth.id = usuario_id',
      createRule: "@request.auth.perfil = 'Atendente'",
      updateRule: '@request.auth.id = usuario_id',
      deleteRule: "@request.auth.perfil = 'Atendente'",
      fields: [
        { name: 'usuario_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'tipo', type: 'select', values: ['WhatsApp', 'Email', 'Sistema'] },
        { name: 'titulo', type: 'text' },
        { name: 'mensagem', type: 'text' },
        { name: 'lido', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notificacoes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notificacoes'))
  },
)
