import { Router } from 'express';
import * as ctrl from './mpesa.controller';

const router = Router();

// Daraja webhooks — NO auth (Safaricom calls these)
router.post('/stk-callback', ctrl.stkCallback);
router.post('/b2c-callback', ctrl.b2cCallback);
router.post('/b2c-timeout',  ctrl.b2cTimeout);

export default router;
