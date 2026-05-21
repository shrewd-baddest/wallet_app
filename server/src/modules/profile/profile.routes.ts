import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getProfile } from '../../controllers/profile';

const router = Router();

router.get('/', authenticate, getProfile);

export default router;
