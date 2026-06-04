import { Router } from 'express';
import { submitRating, modifyRating, deleteRating } from '../controllers/ratingController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireRole(['user']));

router.post('/', submitRating);
router.put('/', modifyRating);
router.delete('/:storeId', deleteRating);

export default router;
