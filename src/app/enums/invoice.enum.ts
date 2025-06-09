export enum StatusInvoice {
  DRAFT = 'borrador',
  SENT = 'enviada',
  // DECLINED = 'rechazada',
  // ACCEPTED = 'aceptada',
  // INVOICED = 'facturada',
  REMOVED = 'removida',
}

export enum InvoiceFormAction {
  SAVE = 'save',
  SEND = 'send', // send email
  MARK_AS_SENT = 'mark_as_sent',
}

export enum EditInvoiceFormAction {
  EDIT = 'edit',
  EDIT_AND_SEND = 'edit_and_send', // send email
}
