onRecordAfterUpdateSuccess((e) => {
  const origStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')
  const resposta = e.record.getString('resposta')

  if (
    origStatus !== 'Validado' &&
    origStatus !== 'Rejeitado' &&
    (newStatus === 'Validado' || newStatus === 'Rejeitado')
  ) {
    try {
      const chamado = $app.findRecordById('chamados', e.record.getString('chamado_id'))
      const atendenteId = chamado.getString('atendente_id')

      if (atendenteId) {
        const notifCol = $app.findCollectionByNameOrId('notificacoes')
        const notif = new Record(notifCol)
        notif.set('usuario_id', atendenteId)
        notif.set('tipo', 'Sistema')

        if (resposta === 'Validei') {
          notif.set('titulo', 'Chamado Validado')
          notif.set('mensagem', `O cliente validou o chamado ${chamado.getString('numero')}.`)
        } else if (resposta === 'Não funcionou') {
          notif.set('titulo', 'Chamado Rejeitado')
          notif.set(
            'mensagem',
            `O cliente rejeitou a solução do chamado ${chamado.getString('numero')}.`,
          )
        }

        notif.set('lido', false)
        $app.saveNoValidate(notif)
      }
    } catch (err) {
      $app.logger().error('Error creating validation notification', 'error', err)
    }
  }
  e.next()
}, 'validacoes')
