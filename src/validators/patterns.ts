import { body, header, param } from 'express-validator';

export const patternBody = {
  get email() {
    return body('email').isEmail();
  },
  get password() {
    return body('password').isLength({ min: 8, max: 64 });
  },
};

export const patternHeader = {
  get authorizationToken() {
    return header('Authorization')
      .custom((value) => value?.includes('Bearer '))
      .withMessage('Invalid token format');
  },
};

export const patternParam = {
  get activeToken() {
    return param('activeToken').isUUID();
  },
};
