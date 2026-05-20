import { Router } from 'express';
import { body } from 'express-validator';
import * as ctrl from './auth.controller';
import validate from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router();

const phoneRule = body('phone_number')
  .notEmpty().withMessage('Phone number is required')
  .matches(/^254[0-9]{9}$/).withMessage('Phone must be in format 254XXXXXXXXX');

const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number');

router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    phoneRule,
    passwordRule,
  ],
  validate,
  ctrl.register
);

router.post(
  '/verify-phone',
  [phoneRule, body('otp_code').notEmpty().withMessage('OTP code is required')],
  validate,
  ctrl.verifyPhone
);

router.post('/resend-otp', [phoneRule], validate, ctrl.resendOtp);

router.post(
  '/login',
  [phoneRule, body('password').notEmpty().withMessage('Password is required')],
  validate,
  ctrl.login
);

router.get('/me', authenticate, ctrl.me);

router.patch(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  ctrl.changePassword
);

export default router;
