import { Router } from 'express';
import { getSharedNote } from '../controllers/notesController.js';

const router = Router();
router.get('/:shareId', getSharedNote);
export default router;
