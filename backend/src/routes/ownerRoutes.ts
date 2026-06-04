import { Router } from 'express';
import { getOwnerStoreStats } from '../controllers/ownerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/store-stats', authenticateToken, requireRole(['store_owner']), getOwnerStoreStats);

export default router;
