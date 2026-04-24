const collectionsToAudit = ['chamados', 'clientes', 'validacoes']

onRecordAfterCreateSuccess(
  (e) => {
    const auditCol = $app.findCollectionByNameOrId('logs_auditoria')
    const record = new Record(auditCol)
    record.set('usuario_id', e.auth ? e.auth.id : null)
    record.set('tabela', e.collection.name)
    record.set('acao', 'INSERT')
    record.set('dados_anteriores', null)
    record.set('dados_novos', e.record.publicExport())
    $app.saveNoValidate(record)
    e.next()
  },
  ...collectionsToAudit,
)

onRecordAfterUpdateSuccess(
  (e) => {
    const auditCol = $app.findCollectionByNameOrId('logs_auditoria')
    const record = new Record(auditCol)
    record.set('usuario_id', e.auth ? e.auth.id : null)
    record.set('tabela', e.collection.name)
    record.set('acao', 'UPDATE')
    record.set('dados_anteriores', e.record.original().publicExport())
    record.set('dados_novos', e.record.publicExport())
    $app.saveNoValidate(record)
    e.next()
  },
  ...collectionsToAudit,
)

onRecordAfterDeleteSuccess(
  (e) => {
    const auditCol = $app.findCollectionByNameOrId('logs_auditoria')
    const record = new Record(auditCol)
    record.set('usuario_id', e.auth ? e.auth.id : null)
    record.set('tabela', e.collection.name)
    record.set('acao', 'DELETE')
    record.set('dados_anteriores', e.record.publicExport())
    record.set('dados_novos', null)
    $app.saveNoValidate(record)
    e.next()
  },
  ...collectionsToAudit,
)
