import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../controllers/types';
import { Account } from '../models/Account';
import { AccountRole } from '../models/types';

/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *        bearerFormat: JWT
 */

/**
 * @swagger
 *  components:
 *    responses:
 *      protected:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Bearer token not found
 *                success:
 *                  type: boolean
 *                  example: false
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.custom = {
      authorization: {
        isLoggedIn: false,
      },
    };

    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new Error('[Authorization middleware] Bearer token not found');
    }

    const [_, token] = bearerToken.split('Bearer ');

    const { id, isRefreshToken } = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as ITokenPayload;

    if (isRefreshToken) {
      throw new Error(
        '[Authorization middleware] You can not use the refresh token for authorization'
      );
    }

    const account = await Account.findOne({ where: { id } });

    if (!account) {
      throw new Error('[Authorization middleware] Account not found');
    }

    req.custom.authorization = {
      isLoggedIn: true,
      account,
    };

    next();
  } catch (e) {
    const error = e as Error;
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.custom = {
      authorization: {
        isLoggedIn: false,
      },
    };

    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new Error('[Authorization middleware] Bearer token not found');
    }

    const [_, token] = bearerToken.split('Bearer ');

    const { id, isRefreshToken } = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as ITokenPayload;

    if (!isRefreshToken) {
      throw new Error(
        '[Authorization middleware] You should not use the token for refreshing'
      );
    }

    const account = { id };

    req.custom.authorization = {
      isLoggedIn: false,
      account,
    };

    next();
  } catch (e) {
    const error = e as Error;
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isLoggedIn, account } = req.custom.authorization;

    if (!isLoggedIn || !account) {
      throw new Error('[Authorization middleware] You are not logged in');
    }

    if (account.role !== AccountRole.ADMIN) {
      throw new Error('[Authorization middleware] You are not administrator');
    }

    next();
  } catch (e) {
    const error = e as Error;
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};
