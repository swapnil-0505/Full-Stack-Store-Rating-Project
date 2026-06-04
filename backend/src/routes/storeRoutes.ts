import { Router } from 'express';
import { listStoresForUser } from '../controllers/storeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, listStoresForUser);

export default router;
