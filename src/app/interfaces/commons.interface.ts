export interface IMessage {
  msg: string;
}

export interface ShortAuth {
  uid: number;
  name: string;
}

export interface ICommonSelect {
  id: number;
  name: string;
}

export interface ICodeLabel {
  label: string;
  code: string;
}

export interface ITotals {
  iva: number;
  discounts: number;
  subtotal: number;
  total: number;
}

/* Tracking */
export interface IAddTrackingNote {
  createdAt: string;
  note: string;
  refEntity: string;
  refEntityId: number;
}

export interface IDataEntity {
  refEntity: string;
  refEntityId: number;
}
