import { Router } from 'express';
import { authenticate, requireVerified } from '../../middleware/auth';
import { getProfile } from '../../controllers/profile';

const router = Router();

router.use(authenticate, requireVerified);
router.get('/', getProfile);

export default router;
