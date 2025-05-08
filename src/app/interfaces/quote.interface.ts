import { IClient, IShortSelectClient } from './client.interface';
import { ITracking } from './tracking.interface';

export interface IQuoteAndCount {
  count: number;
  quotes: IQuote[];
}

export interface IQuote {
  id: number;
  status: string;
  quoteNumber: string;
  total: number;
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
  client: IShortSelectClient;
  status: string;
  initDate: string;
  expireDate?: string;
  currency: string;
  terms?: string;
  quoteItems: IDataToCreateQuoteItem[];
  // reference properties
  action: string;
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

export interface IDataToModalEmailSendQuote {
  quote: IDataToCreateQuote;
  total: number;
}

// DATA SUBMIT NEW QUOTE ALWAYS
export interface IDataToSubmitAndSendNewQuote {
  email: IDataEmailForSendQuote | null;
  quote: IDataToCreateQuote;
}

export interface IDataEmailForSendQuote {
  emails: string[];
  subject?: string;
  message?: string;
}
