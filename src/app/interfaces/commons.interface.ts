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
