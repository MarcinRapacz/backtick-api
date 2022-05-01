import { Model, Optional } from 'sequelize';

/* 
  ACCOUNT MODEL
*/

export enum AccountRole {
  ADMIN = 'admin',
  PREMIUM = 'premium',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

interface IAccountAttributes {
  id: string;
  email: string;
  password: string;
  activeToken: string | null;
  role: AccountRole;
}

export interface IAccountModel
  extends Model<IAccountAttributes, Optional<IAccountAttributes, 'id'>>,
    IAccountAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}
