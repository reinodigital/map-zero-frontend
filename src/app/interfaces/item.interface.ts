export interface IItemAndCount {
  count: number;
  items: IItem[];
}

export interface IItem {
  id: number;
  name: string;
  cabys: ICabys;
  costPrice: number;
  purchaseAccount: string;
  purchaseTaxRate: string;
  purchaseDescription?: string;
  salePrice: number;
  saleAccount: string;
  saleTaxRate: string;
  saleDescription?: string;
  createdAt: Date;
  itemHistory: IItemHistory[];
}

export interface ICabys {
  id: number;
  code: string;
  tax: number;
}

export interface IItemHistory {
  id: number;
  action: string;
  executedAt: Date;
  executedBy?: string;
  description: string;
}

export interface IDataToCreateItem {
  name: string;
  createdAt: string;
  cabys: string;
  costPrice: number;
  purchaseAccount: string;
  purchaseTaxRate: string;
  purchaseDescription?: string;
  salePrice: number;
  saleAccount: string;
  saleTaxRate: string;
  saleDescription?: string;
}

export interface IDataToUpdateItem {
  name: string;
  updatedAt: string;
  cabys: string;
  costPrice: number;
  purchaseAccount: string;
  purchaseTaxRate: string;
  purchaseDescription?: string;
  salePrice: number;
  saleAccount: string;
  saleTaxRate: string;
  saleDescription?: string;
}
