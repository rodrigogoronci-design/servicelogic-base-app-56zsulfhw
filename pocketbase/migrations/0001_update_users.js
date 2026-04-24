migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({
        name: 'perfil',
        values: ['Atendente', 'Cliente'],
        required: true,
      }),
    )
    users.fields.add(
      new BoolField({
        name: 'ativo',
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('perfil')
    users.fields.removeByName('ativo')
    app.save(users)
  },
)
