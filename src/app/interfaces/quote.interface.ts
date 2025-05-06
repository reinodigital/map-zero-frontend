import { IClient } from './client.interface';
import { ITracking } from './tracking.interface';

export interface IQuoteAndCount {
  count: number;
  quotes: IQuote[];
}

export interface IQuote {
  id: number;
  status: string;
  quoteNumber: string;
  initDate?: Date;
  expireDate?: Date;
  currency: string;
  terms?: string; // field to explain some term or condition
  client: IClient;
  quoteItems: IQuoteItem[];
  tracking: ITracking[];
}

export interface IQuoteItem {
  id: number;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account?: string;
  taxRate?: string;
  amount: number;
}

export interface IDataToCreateQuote {
  createdAt: string;
  clientId: number;
  status: string;
  quoteNumber: string;
  initDate: string;
  expireDate?: string;
  currency: string;
  terms?: string;
  quoteItems: IDataToCreateQuoteItem[];
}

export interface IDataToCreateQuoteItem {
  itemId: number;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account: string;
  taxRate: string;
}
