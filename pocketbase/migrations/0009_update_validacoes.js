migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('validacoes')

    if (!col.fields.getByName('token')) {
      col.fields.add(new TextField({ name: 'token' }))
    }
    if (!col.fields.getByName('data_expiracao')) {
      col.fields.add(new DateField({ name: 'data_expiracao' }))
    }

    app.save(col)

    // Add unique index on token
    col.addIndex('idx_validacoes_token', true, 'token', "token != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('validacoes')
    col.removeIndex('idx_validacoes_token')
    col.fields.removeByName('token')
    col.fields.removeByName('data_expiracao')
    app.save(col)
  },
)
