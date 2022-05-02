import express from 'express';
import * as Controller from '../controllers/AccountController';
import * as authorization from '../middlewares/authorization';
import { handleValidator } from '../middlewares/validator';
import * as validator from '../validators/AccountValidator';

const router = express.Router();

/**
 * Login
 */
router.post('/login', [...handleValidator(validator.login)], Controller.login);

/**
 * Create
 */
router.post(
  '/register',
  [
    ...handleValidator(validator.register),
    authorization.protect,
    authorization.isAdmin,
  ],
  Controller.register
);

/**
 * Recover password
 */
router.post(
  '/recover-password',
  [...handleValidator(validator.recoverPassword)],
  Controller.recoverPassword
);

/**
 * Return details
 */
router.get(
  '/me',
  [...handleValidator(validator.recoverPassword), authorization.protect],
  Controller.me
);

/**
 * Active
 */
router.put(
  '/active/:activeToken',
  [...handleValidator(validator.active)],
  Controller.active
);

/**
 * Deactivate password recovery link
 */
router.put(
  '/deactivate-password-recovery-link',

  [
    ...handleValidator(validator.deactivatePasswordRecoveryLink),
    authorization.protect,
  ],
  Controller.deactivatePasswordRecoveryLink
);

/**
 * Refresh token
 */
router.get(
  '/refresh-token',
  [...handleValidator(validator.refreshToken), authorization.refresh],
  Controller.refreshToken
);

/**
 * Remove
 */
router.delete(
  '/delete',
  [...handleValidator(validator.remove), authorization.protect],
  Controller.remove
);

export default router;
