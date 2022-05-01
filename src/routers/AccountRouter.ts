import express from 'express';
import * as Controller from '../controllers/AccountController';
import * as authorization from '../middlewares/authorization';

const router = express.Router();

/**
 * Login
 */
router.post('/login', Controller.login);

/**
 * Create Account
 */
router.post('/register', Controller.register);

/**
 * Recover password
 */
router.post('/recover-password', Controller.recoverPassword);

/**
 * Return account details
 */
router.get('/me', authorization.protect, Controller.me);

/**
 * Active user
 */
router.get('/active', Controller.active);

/**
 * Refresh token
 */
router.get('/refresh-token', authorization.refresh, Controller.refreshToken);

export default router;