import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../controllers/types';
import { Account } from '../models/Account';

// Check that the token is correct
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

// Only refresh tokens
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
