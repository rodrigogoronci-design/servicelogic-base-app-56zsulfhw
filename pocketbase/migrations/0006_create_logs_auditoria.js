migrate(
  (app) => {
    const logs = new Collection({
      name: 'logs_auditoria',
      type: 'base',
      listRule: "@request.auth.perfil = 'Atendente'",
      viewRule: "@request.auth.perfil = 'Atendente'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'usuario_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'tabela', type: 'text' },
        { name: 'acao', type: 'text' },
        { name: 'dados_anteriores', type: 'json' },
        { name: 'dados_novos', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(logs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('logs_auditoria'))
  },
)
