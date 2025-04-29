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
  addresses: IClientAddress[];
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

// ======= Client address ========
export interface IClientAddress {
  id: number;
  provinceCode: string;
  provinceName: string;
  cantonCode: string;
  cantonName: string;
  districtCode: string;
  districtName: string;
  exactAddress: string | null;
}
export interface IDataToCreateNewClientAddress {
  provinceName: string;
  provinceCode: string;
  cantonName: string;
  cantonCode: string;
  districtName: string;
  districtCode: string;
  exactAddress: string | null;
}
