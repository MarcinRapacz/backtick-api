import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Account } from '../models/Account';
import { AccountRole, IAccountModel } from '../models/types';
import { IAccountRequest, IAccountResponse, ITokenPayload } from './types';

/**
 * @swagger
 *  tags:
 *    name: Account
 *    description: The Account managing API
 */

/**
 * @swagger
 *  /api/account/register:
 *    post:
 *      summary: Create new account (only admin)
 *      tags: [Account]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                email:
 *                  type: string
 *                  example: test@test.com
 *      responses:
 *        201:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Created Account
 *                  activeUrl:
 *                    type: string
 *                    example: http://localhost:8000/api/account/active-account/6d0ec407-e6b3-4bee-a640-3819fe093ddc
 *                  success:
 *                    type: boolean
 *                    example: true
 *        400:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: An account with the given email address already exists
 *                  success:
 *                    type: boolean
 *                    example: false
 *
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const register = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const accountExists = await Account.findOne({ where: { email } });
    if (accountExists) {
      return res.status(400).json({
        message: 'An account with the given email address already exists',
        success: false,
      });
    }

    const activeToken = crypto.randomUUID();
    await Account.create({
      id: crypto.randomUUID(),
      email,
      password: activeToken,
      activeToken,
      role: AccountRole.CUSTOMER,
    });

    const activeUrl = `${process.env.CLIENT_URL}/api/account/active-account/${activeToken}`;
    // TODO: Send active url by email

    res.status(201).json({
      success: true,
      message: 'Created new account',
      activeUrl,
    });
  } catch (error) {
    next(`[AccountController > create] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/login:
 *    post:
 *      summary: Login
 *      tags: [Account]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/hidden/_BaseAccount'
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Logged in
 *                  token:
 *                    type: string
 *                    example: Bearer token
 *                  refreshToken:
 *                    type: string
 *                    refreshToken: Bearer refresh token
 *                  success:
 *                    type: boolean
 *                    example: true
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const login = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ where: { email } });

    if (!account || !bcrypt.compareSync(password, account.password)) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false,
      });
    }

    const { token, refreshToken } = generateTokens(account);

    res.status(200).json({
      success: true,
      message: 'Logged in',
      token,
      refreshToken,
    });
  } catch (error) {
    next(`[AccountController > login] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/recover-password:
 *    post:
 *      summary: TODO Recover password
 *      tags: [Account]
 *      responses:
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const recoverPassword = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      message: 'TODO: recoverPassword',
      success: false,
    });
  } catch (error) {
    next(`[AccountController > recoverPassword] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/me:
 *    get:
 *      summary: Account details
 *      tags: [Account]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Account details
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  account:
 *                    $ref: '#/components/schemas/Account'
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const me = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { account } = req.custom.authorization;
    account.password = undefined;

    res.status(200).json({
      message: 'Account details',
      success: true,
      account,
    });
  } catch (error) {
    next(`[AccountController > me] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/active:
 *    get:
 *      summary: TODO Active account
 *      tags: [Account]
 *      responses:
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const active = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      message: 'TODO: active',
      success: false,
    });
  } catch (error) {
    next(`[AccountController > active] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/refresh-token:
 *    get:
 *      summary: Refresh token
 *      tags: [Account]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: New tokens have been generated
 *                  token:
 *                    type: string
 *                    example: token
 *                  refreshToken:
 *                    type: string
 *                    refreshToken: refreshToken
 *                  success:
 *                    type: boolean
 *                    example: true
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const refreshToken = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { token, refreshToken } = generateTokens(
      req.custom.authorization.account
    );

    res.status(200).json({
      success: true,
      message: 'New tokens have been generated',
      token,
      refreshToken,
    });
  } catch (error) {
    next(`[AccountController > refreshToken] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/delete:
 *    delete:
 *      summary: Remove account
 *      tags: [Account]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Account has been destroyed
 *                  success:
 *                    type: boolean
 *                    example: true
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const remove = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { id } = req.custom.authorization.account;
    await Account.destroy({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Account has been destroyed',
    });
  } catch (error) {
    next(`[AccountController > remove] ${error}`);
  }
};

const generateTokens = (account: IAccountModel) => {
  const payload = {
    id: account.id,
  };

  const tokenPayload: ITokenPayload = {
    ...payload,
    isRefreshToken: false,
  };

  const refreshTokenPayload: ITokenPayload = {
    ...payload,
    isRefreshToken: true,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  return {
    token: `Bearer ${token}`,
    refreshToken: `Bearer ${refreshToken}`,
  };
};
