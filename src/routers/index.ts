import express from 'express';
import AccountRouter from './AccountRouter';

const router = express.Router();

router.use('/account', AccountRouter);

export default router;
