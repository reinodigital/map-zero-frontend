export interface ICountAndAccountAll {
  count: number;
  accounts: IAccount[];
}

export interface IAccount {
  id: number;
  code: string;
  name: string;
  description?: string;
  tax?: string;
  isActive: boolean;
  accountType: IAccountType;
}

export interface IAccountType {
  id: number;
  name: string;
  category: string;
}

// ========= related with modal account form ===========
export interface IDataModalAccountForm {
  id: number | null;
  account: IPayloadAccountForm | null;
}
export interface IPayloadAccountForm {
  accountTypeId: number;
  name: string;
  code: string;
  description: string | null;
  tax: string | null;
}
// ========= end related with modal account form ===========
