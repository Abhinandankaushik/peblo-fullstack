import { Router } from 'express';
import {
  getNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
  generateAI,
  shareNote,
  unshareNote,
} from '../controllers/notesController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/generate', generateAI);
router.post('/:id/share', shareNote);
router.delete('/:id/share', unshareNote);

export default router;
