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
