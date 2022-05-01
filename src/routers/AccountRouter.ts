import express from 'express';
import * as Controller from '../controllers/AccountController';
import * as authorization from '../middlewares/authorization';

const router = express.Router();

/**
 * Login
 */
router.post('/login', Controller.login);

/**
 * Create
 */
router.post(
  '/register',
  [authorization.protect, authorization.isAdmin],
  Controller.register
);

/**
 * Recover password
 */
router.post('/recover-password', Controller.recoverPassword);

/**
 * Return details
 */
router.get('/me', authorization.protect, Controller.me);

/**
 * Active
 */
router.put('/active/:activeToken', Controller.active);

/**
 * Deactivate password recovery link
 */
router.put(
  '/deactivate-password-recovery-link',
  authorization.protect,
  Controller.deactivatePasswordRecoveryLink
);

/**
 * Refresh token
 */
router.get('/refresh-token', authorization.refresh, Controller.refreshToken);

/**
 * Remove
 */
router.delete('/delete', authorization.protect, Controller.remove);

export default router;
