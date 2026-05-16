import { Router } from 'express';
import { getInsights } from '../controllers/insightsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', getInsights);
export default router;
