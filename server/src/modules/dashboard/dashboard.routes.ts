import { Router } from 'express';
import { authenticate, requireVerified } from '../../middleware/auth';
import { getDashboard } from '../../controllers/Dashoard';

const router = Router();

router.use(authenticate, requireVerified);
router.get('/', getDashboard);

export default router;
