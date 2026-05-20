import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './admin.controller';
import validate from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

// NOTE: In production add a proper admin role check middleware.
const router = Router();

router.use(authenticate);

router.get('/stats',               ctrl.getStats);
router.get('/users',               ctrl.listUsers);
router.get('/failed-transactions', ctrl.getFailedTransactions);
router.get('/logs',                ctrl.getTransactionLogs);

router.patch(
  '/users/:userId/wallet-status',
  [body('status').isIn(['active', 'suspended']).withMessage('Status must be active or suspended')],
  validate,
  ctrl.setWalletStatus
);

export default router;
