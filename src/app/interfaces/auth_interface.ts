export interface IAuth {
  uid: number;
  name: string;
  mobile: string;
  email?: string;
  roles: string[];
  token?: string;
  isActive: number;
}

export interface IAuthToLogin {
  email: string;
  password: string;
}

export interface IAuthToSignUp {
  name: string;
  mobile: string;
  email: string;
  password: string;
  roles: string[];
}

export interface IAuthToUpdate {
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
  roles: string[];
}

export interface IAuthAndCount {
  count: number;
  users: IAuth[];
}
