import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from './wallet.controller';
import validate from '../../middleware/validate';
import { authenticate, requireVerified } from '../../middleware/auth';

const router = Router();

const phoneRule = body('phone_number')
  .matches(/^254[0-9]{9}$/)
  .withMessage('Phone must be in format 254XXXXXXXXX');

const amountRule = body('amount')
  .isFloat({ min: 1, max: 150000 })
  .withMessage('Amount must be between KES 1 and 150,000');

router.use(authenticate, requireVerified);

router.get('/', ctrl.getWallet);

router.post('/deposit', [amountRule, phoneRule], validate, ctrl.initiateDeposit);

router.post(
  '/withdraw',
  [
    amountRule,
    phoneRule,
    body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal is KES 10'),
  ],
  validate,
  ctrl.initiateWithdrawal
);

router.get(
  '/withdraw/status/:withdrawal_id',
  [param('withdrawal_id').isInt()],
  validate,
  ctrl.queryWithdrawStatus
);

router.get(
  '/deposit/status/:checkout_request_id',
  [param('checkout_request_id').notEmpty()],
  validate,
  ctrl.queryStkStatus
);

export default router;
