import { Model, Optional } from 'sequelize';

/* 
  ACCOUNT MODEL
*/

export enum AccountRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

interface IAccountAttributes {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  role: AccountRole;
}

export interface IAccountModel
  extends Model<IAccountAttributes, Optional<IAccountAttributes, 'id'>>,
    IAccountAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}
