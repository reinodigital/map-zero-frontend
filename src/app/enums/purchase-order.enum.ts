export enum StatusPurchaseOrder {
  DRAFT = 'borrador',
  SENT = 'enviada',
  APPROVED = 'aprobada',
  AWAITING_APPROVAL = 'esperando_aprobación',
  BILLED = 'pagada',
  REMOVED = 'removida',
}

export enum NewPurchaseOrderFormAction {
  SAVE = 'save',
  SEND = 'send', // send email
  MARK_AS_SENT = 'mark_as_sent',
}

export enum EditPurchaseOrderFormAction {
  EDIT = 'edit',
  EDIT_AND_SEND = 'edit_and_send', // send email
}
