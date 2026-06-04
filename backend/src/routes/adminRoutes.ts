import { Router } from 'express';
import { getStats, createUser, createStore, listUsers, listStores } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin routes with authentication and requireRole('admin')
router.use(authenticateToken, requireRole(['admin']));

router.get('/stats', getStats);
router.post('/users', createUser);
router.post('/stores', createStore);
router.get('/users', listUsers);
router.get('/stores', listStores);

export default router;
