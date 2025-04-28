export interface IClient {
  id: number;
  name: string;
  createdAt: Date;
  email: string;
  mobile: string;
  identity: string;
  identityType: string;
  isActive: boolean;
  currency: string;
  notes?: string;
  defaultSeller?: string;
}

export interface IClientAndCount {
  count: number;
  clients: IClient[];
}

export interface IClientToUpdate {
  name: string;
  mobile: string;
  email: string;
  identity: string;
  identityType: string;
  currency: string;
  notes?: string;
  defaultSeller?: string;
}
