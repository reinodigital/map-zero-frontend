import { IAccount } from './account.interface';
import { IClient, IShortSelectClient } from './client.interface';
import { ShortAuth } from './commons.interface';
import { IItem } from './item.interface';
import { ITracking } from './tracking.interface';

export interface IPurchaseOrderAndCount {
  count: number;
  purchaseOrders: IPurchaseOrder[];
  total: number;
  statusCounts?: {
    [StatusPurchaseOrder: string]: number;
  };
}

export interface IPurchaseOrder {
  id: number;
  status: string;
  purchaseOrderNumber: string;
  total: number;
  initDate?: Date;
  deliveryDate?: Date;
  currency: string;
  deliveryInstructions?: string;
  client: IClient;
  purchaseOrderItems: IPurchaseOrderItem[];
  tracking: ITracking[];
}

export interface IPurchaseOrderItem {
  id: number;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account?: IAccount;
  taxRate?: string;
  amount: number;
  item: IItem;
  seller: ShortAuth | null;
}

export interface IDataToCreatePurchaseOrder {
  createdAt: string;
  client: IShortSelectClient;
  status: string;
  initDate: string;
  deliveryDate?: string;
  currency: string;
  deliveryInstructions?: string;
  purchaseOrderItems: IDataToCreatePurchaseOrderItem[];
  // reference properties
  action: string;
}
export interface IDataToUpdatePurchaseOrder {
  updatedAt: string;
  client: IShortSelectClient;
  status: string;
  initDate: string;
  deliveryDate?: string;
  currency: string;
  deliveryInstructions?: string;
  purchaseOrderItems: IDataToCreatePurchaseOrderItem[];
  // reference properties
  action: string;
}

export interface IDataToCreatePurchaseOrderItem {
  id?: number; // optional for new items
  itemId: number;
  sellerUid: number | null;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  account: string;
  taxRate: string;
}

// This should removed so ICustomDataToModalEmailSendPurchaseOrder is better
export interface IDataToModalEmailSendPurchaseOrder {
  purchaseOrder: IDataToCreatePurchaseOrder;
  total: number;
}

export interface ICustomDataToModalEmailSendPurchaseOrder {
  clientName: string;
  currency: string;
  deliveryInstructions?: string;
  // reference properties
  total: number;
}

export interface IDataEmailForSendPurchaseOrder {
  sentAt: string;
  emails: string[];
  subject?: string;
  message?: string;
}

export interface IMarkAndChangeStatusPurchaseOrder {
  updatedAt: string;
}

export interface ICreateInvoiceFromAcceptedPurchaseOrder {
  createdAt: string;
  markAsInvoiced: boolean | null;
}
