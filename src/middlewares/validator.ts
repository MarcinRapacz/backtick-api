import { NextFunction, Request, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

export const handleValidator = (options: ValidationChain[]) => [
  ...options,
  handleErrorValidator,
];

export const handleErrorValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req as Request);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      message: 'Validation error',
      success: false,
    });
  }

  next();
};
