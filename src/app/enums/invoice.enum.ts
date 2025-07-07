export enum StatusInvoice {
  DRAFT = 'borrador',
  SENT = 'enviada',
  AWAITING_APPROVAL = 'esperando_aprobación',
  AWAITING_PAYMENT = 'esperando_pago',
  PAID = 'pagada',
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
