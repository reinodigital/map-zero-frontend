import { IAccount } from './account.interface';
import { ITracking } from './tracking.interface';

export interface IItemAndCount {
  count: number;
  items: IItem[];
}

export interface IItem {
  id: number;
  name: string;
  cabys: ICabys;
  costPrice?: number;
  purchaseAccount?: IAccount;
  purchaseTaxRate?: string;
  purchaseDescription?: string;
  salePrice?: number;
  saleAccount?: IAccount;
  saleTaxRate?: string;
  saleDescription?: string;
  createdAt: Date;
  tracking: ITracking[];
}

export interface ICabys {
  id: number;
  code: string;
  tax: number;
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

export interface IItemForSelectOnSale {
  id: number;
  name: string;
  cabys: ICabys;
  salePrice?: number;
  saleAccount?: IAccount;
  saleTaxRate?: string;
  saleDescription?: string;
}

export interface IItemSuggestion {
  id: number | null;
  name: string;
  shortName: string;
  cabys: string;
  description: string;
  salePrice: number;
  saleAccountId: number | null;
  // type: string | null; // in case of make it generic
}
