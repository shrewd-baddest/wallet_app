import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './transfers.controller';
import validate from '../../middleware/validate';
import { authenticate, requireVerified } from '../../middleware/auth';

const router = Router();

router.use(authenticate, requireVerified);

router.post(
  '/send',
  [
    body('recipient_phone')
      .matches(/^254[0-9]{9}$/)
      .withMessage('Recipient phone must be in format 254XXXXXXXXX'),
    body('amount')
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('Amount must be between KES 1 and 1,000,000'),
    body('description').optional().isString().isLength({ max: 255 }),
  ],
  validate,
  ctrl.sendMoney
);

router.get('/', ctrl.getTransfers);

export default router;
