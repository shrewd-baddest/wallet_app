import { Router } from 'express';
import { query, param } from 'express-validator';
import * as ctrl from './transactions.controller';
import validate from '../../middleware/validate';
import { authenticate, requireVerified } from '../../middleware/auth';

const router = Router();

router.use(authenticate, requireVerified);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['deposit', 'withdrawal', 'transfer_sent', 'transfer_received']),
    query('status').optional().isIn(['pending', 'completed', 'failed']),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
  ],
  validate,
  ctrl.listTransactions
);

router.get(
  '/statement',
  [query('from').optional().isISO8601(), query('to').optional().isISO8601()],
  validate,
  ctrl.getStatement
);

router.get('/:id', [param('id').isInt()], validate, ctrl.getTransaction);

export default router;
