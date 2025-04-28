import { TypeMessageToast } from '../enums';

export interface IDataToast {
  message: string;
  duration: number;
  type: TypeMessageToast;
}
