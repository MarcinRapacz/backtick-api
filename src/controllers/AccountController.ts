import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
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
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  example: test@test.com
 *                  format: email
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
 *                    example: http://localhost:8000/api/account/active/6d0ec407-e6b3-4bee-a640-3819fe093ddc
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

    const activeUrl = `${process.env.CLIENT_URL}/account/active/${activeToken}`;
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
 *                    example: Bearer refresh token
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
 *      summary: Recover password
 *      tags: [Account]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  example: test@test.com
 *                  format: email
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Password change link has been sent
 *                  success:
 *                    type: boolean
 *                    example: true
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const recoverPassword = async (
  req: IAccountRequest,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const account = await Account.findOne({ where: { email } });

    if (account) {
      const activeToken = crypto.randomUUID();
      account.activeToken = activeToken;
      await account.save();
      // TODO: Send active url by email
    }

    res.status(200).json({
      message:
        '[AccountController > recoverPassword] Password change link has been sent',
      success: true,
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
  req: Request,
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
 *                    example: refreshToken
 *                  success:
 *                    type: boolean
 *                    example: true
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const refreshToken = async (
  req: Request,
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
 *  /api/account/active/:active-token:
 *    put:
 *      summary: Active account
 *      tags: [Account]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                password:
 *                  type: string
 *                  example: 5dsJBI1cv5XMsycAD58HjlkdrxrfdmLw
 *                  minLength: 8
 *                  maxLength: 64
 *      parameters:
 *        - in: path
 *          name: active-token
 *          schema:
 *            type: string
 *            required: true
 *            format: uuid
 *      responses:
 *        200:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Account has been activated
 *                  token:
 *                    type: string
 *                    example: Bearer token
 *                  refreshToken:
 *                    type: string
 *                    example: Bearer refresh token
 *                  success:
 *                    type: boolean
 *                    example: true
 *        404:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Account not found
 *                  success:
 *                    type: boolean
 *                    example: false
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const active = async (
  req: IAccountRequest<{ activeToken: string }>,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const { activeToken } = req.params;
    const { password } = req.body;

    const account = await Account.findOne({
      where: {
        activeToken,
      },
    });

    if (!account) {
      return res.status(404).json({
        message: '[AccountController > active] Account not found',
        success: false,
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password, salt);

    account.activeToken = null;
    account.password = encryptedPassword;
    await account.save();

    const { token, refreshToken } = generateTokens(account);

    res.status(200).json({
      message: '[AccountController > active] Account has been activated',
      success: true,
      token,
      refreshToken,
    });
  } catch (error) {
    next(`[AccountController > active] ${error}`);
  }
};

/**
 * @swagger
 *  /api/account/deactivate-password-recovery-link:
 *    put:
 *      summary: Deactive recovery link
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
 *                    example: Recovery link has been deactivated
 *                  success:
 *                    type: boolean
 *                    example: true
 *        401:
 *          $ref: '#/components/responses/protected'
 *        500:
 *          $ref: '#/components/hidden/_ServerError'
 */
export const deactivatePasswordRecoveryLink = async (
  req: Request,
  res: Response<IAccountResponse>,
  next: NextFunction
) => {
  try {
    const account: IAccountModel = req.custom.authorization.account;
    account.activeToken = null;
    await account.save();

    res.status(200).json({
      message:
        '[AccountController > deactivatePasswordRecoveryLink] Recovery link has been deactivated',
      success: true,
    });

    // const account = await Account.findOne({where: {id}});
  } catch (error) {
    next(`[AccountController > deactivatePasswordRecoveryLink] ${error}`);
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
  req: Request,
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
