import { Request } from 'express';
import { IAccountModel } from '../models/types';

/* 
    COMMONS
*/
interface IResponse {
  message: string;
  success: boolean;
}

/* 
  ACCOUNT CONTROLLER
*/
export interface IAccountRequest<T = unknown> extends Request<T> {
  body: {
    email: string;
    password: string;
  };
}

export interface IAccountResponse extends IResponse {
  token?: string;
  refreshToken?: string;
  account?: Omit<IAccountModel, 'password'>;
  activeUrl?: string;
}

export interface ITokenPayload {
  id: string;
  isRefreshToken: boolean;
}
