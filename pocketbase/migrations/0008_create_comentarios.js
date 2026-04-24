migrate(
  (app) => {
    const collection = new Collection({
      name: 'comentarios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: '@request.auth.id = usuario_id',
      deleteRule: "@request.auth.perfil = 'Atendente'",
      fields: [
        {
          name: 'chamado_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('chamados').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'texto', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('comentarios')
    app.delete(collection)
  },
)
