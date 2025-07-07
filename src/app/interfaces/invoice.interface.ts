import { IAccount } from './account.interface';
import { IClient, IShortSelectClient } from './client.interface';
import { ShortAuth } from './commons.interface';
import { IItem } from './item.interface';
import { ITracking } from './tracking.interface';

export interface IInvoiceAndCount {
  count: number;
  invoices: IInvoice[];
  total: number;
  statusCounts?: {
    [StatusInvoice: string]: number;
  };
}

export interface IInvoice {
  id: number;
  status: string;
  invoiceNumber: string;
  total: number;
  reference?: string;
  initDate?: Date;
  expireDate?: Date;
  currency: string;
  client: IClient;
  receptorActivities?: string[];
  emisorActivities?: string[];
  invoiceItems: IInvoiceItem[];
  tracking: ITracking[];
}

export interface IInvoiceItem {
  id: number;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account?: IAccount;
  taxRate?: string;
  amount: number;
  item: IItem;
  // seller: ShortAuth | null;
}

export interface IDataToCreateInvoice {
  createdAt: string;
  client: IShortSelectClient;
  status: string;
  initDate: string;
  expireDate?: string;
  currency: string;
  invoiceItems: IDataToCreateInvoiceItem[];
  // reference properties
  reference?: string;
  action: string;
}
export interface IDataToUpdateInvoice {
  updatedAt: string;
  client: IShortSelectClient;
  status: string;
  initDate: string;
  expireDate?: string;
  currency: string;
  invoiceItems: IDataToCreateInvoiceItem[];
  // reference properties
  action: string;
}

export interface IDataToCreateInvoiceItem {
  id?: number; // optional for new items
  itemId: number;
  // sellerUid: number | null;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account: string;
  taxRate: string;
}

// This should removed so ICustomDataToModalEmailSendInvoice is better
export interface IDataToModalEmailSendInvoice {
  invoice: IDataToCreateInvoice;
  total: number;
}

export interface ICustomDataToModalEmailSendInvoice {
  clientName: string;
  currency: string;
  // reference properties
  total: number;
}

export interface IDataEmailForSendInvoice {
  sentAt: string;
  emails: string[];
  subject?: string;
  message?: string;
}

export interface IMarkAndChangeStatusInvoice {
  updatedAt: string;
}
