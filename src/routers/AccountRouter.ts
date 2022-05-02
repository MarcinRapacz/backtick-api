import express from 'express';
import * as controller from '../controllers/AccountController';
import * as authorization from '../middlewares/authorization';
import { handleValidator } from '../middlewares/validator';
import * as validator from '../validators/AccountValidator';

const router = express.Router();

/**
 * Login
 */
router.post('/login', [...handleValidator(validator.login)], controller.login);

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
  controller.register
);

/**
 * Recover password
 */
router.post(
  '/recover-password',
  [...handleValidator(validator.recoverPassword)],
  controller.recoverPassword
);

/**
 * Return details
 */
router.get(
  '/me',
  [...handleValidator(validator.recoverPassword), authorization.protect],
  controller.me
);

/**
 * Active
 */
router.put(
  '/active/:activeToken',
  [...handleValidator(validator.active)],
  controller.active
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
  controller.deactivatePasswordRecoveryLink
);

/**
 * Refresh token
 */
router.get(
  '/refresh-token',
  [...handleValidator(validator.refreshToken), authorization.refresh],
  controller.refreshToken
);

/**
 * Remove
 */
router.delete(
  '/delete',
  [...handleValidator(validator.remove), authorization.protect],
  controller.remove
);

export default router;
