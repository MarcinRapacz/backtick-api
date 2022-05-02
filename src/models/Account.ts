import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/sequelize';
import { IAccountModel } from './types';

/**
 * @swagger
 *  components:
 *    hidden:
 *      _BaseAccount:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            example: test@test.com
 *            format: email
 *          password:
 *            type: string
 *            example: password
 *            minLength: 8
 *            maxLength: 64
 *    schemas:
 *      Account:
 *        allOf:
 *          - $ref: '#/components/hidden/_BaseAccount'
 *          - type: object
 *            properties:
 *              id:
 *                type: string
 *                description: The auto-generated id of the Account
 *                example: 8fc85466-d795-4b63-aa8b-a147b77150bb
 *              activeToken:
 *                type: string
 *                example: encrypted value
 *              role:
 *                type: string
 *                enum: [admin, premium, customer, guest]
 *              updatedAt:
 *                type: string
 *                description: The auto-generated date
 *                example: "2022-04-21T22:46:09.744Z"
 *              createdAt:
 *                type: string
 *                description: The auto-generated date
 *                example: "2022-04-21T22:46:09.744Z"
 */
export const Account = sequelize.define<IAccountModel>('Account', {
  id: {
    allowNull: false,
    autoIncrement: false,
    primaryKey: true,
    type: DataTypes.UUID,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activeToken: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('admin', 'premium', 'customer', 'guest'),
    defaultValue: 'customer',
    allowNull: false,
  },
});
