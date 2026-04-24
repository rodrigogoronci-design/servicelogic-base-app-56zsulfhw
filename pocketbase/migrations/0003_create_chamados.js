migrate(
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')

    const chamados = new Collection({
      name: 'chamados',
      type: 'base',
      listRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      viewRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.perfil = 'Atendente' || cliente_id.usuario_id = @request.auth.id",
      deleteRule: "@request.auth.perfil = 'Atendente'",
      fields: [
        { name: 'numero', type: 'text', required: true },
        {
          name: 'cliente_id',
          type: 'relation',
          collectionId: clientes.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'atendente_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['Aberto', 'Aguardando Cliente', 'Em Análise', 'Fechado'],
        },
        { name: 'prioridade', type: 'select', values: ['Baixa', 'Média', 'Alta'] },
        { name: 'titulo', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'data_criacao', type: 'date' },
        { name: 'data_conclusao', type: 'date' },
        { name: 'tempo_decorrido', type: 'number', onlyInt: true },
        { name: 'jira_issue_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_chamados_numero ON chamados (numero)'],
    })
    app.save(chamados)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('chamados'))
  },
)
