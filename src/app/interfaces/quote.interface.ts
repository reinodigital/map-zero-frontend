import { IClient, IShortSelectClient } from './client.interface';
import { ShortAuth } from './commons.interface';
import { IItem } from './item.interface';
import { ITracking } from './tracking.interface';

export interface IQuoteAndCount {
  count: number;
  quotes: IQuote[];
  total: number;
  statusCounts?: {
    [StatusQuote: string]: number;
  };
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
  item: IItem;
  seller: ShortAuth | null;
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
  sellerUid: number | null;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account: string;
  taxRate: string;
}

// This should removed so ICustomDataToModalEmailSendQuote is better
export interface IDataToModalEmailSendQuote {
  quote: IDataToCreateQuote;
  total: number;
}

export interface ICustomDataToModalEmailSendQuote {
  clientName: string;
  currency: string;
  terms?: string;
  // reference properties
  total: number;
}

// DATA SUBMIT NEW QUOTE ALWAYS
export interface IDataToSubmitAndSaveNewQuote {
  quote: IDataToCreateQuote;
}

export interface IDataEmailForSendQuote {
  sentAt: string;
  emails: string[];
  subject?: string;
  message?: string;
}

export interface IMarkAndChangeStatus {
  updatedAt: string;
}
