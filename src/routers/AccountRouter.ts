import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * Login
 */
router.post('/login', (_req: Request, res: Response) => {
  res.status(200).json('Login, ok');
});

/**
 * Create Account
 */
router.post('/register', (_req: Request, res: Response) => {
  res.status(201).json('Register, ok');
});

/**
 * Reset password
 */
router.post('/recover-password', (_req: Request, res: Response) => {
  res.status(200).json('Recover password, ok');
});

/**
 * Return account details
 */
router.get('/me', (_req: Request, res: Response) => {
  res.status(200).json('Account details, ok');
});

export default router;
