import { generateNoteAI } from '../ai.js';
import {
  listNotesForUser,
  createNoteForUser,
  getNoteByIdAndUser,
  updateNoteById,
  deleteNoteById,
  setShareId,
  removeShareId,
  getSharedNoteByShareId,
} from '../models/noteModel.js';
import { nanoid } from 'nanoid';

export async function getNotes(req, res) {
  try {
    const { q = '', tag = '', archived = '0' } = req.query;
    let notes = await listNotesForUser(req.user.id, archived === '1');

    if (q) {
      const search = q.toLowerCase();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search)
      );
    }

    if (tag) notes = notes.filter(n => n.tags.includes(tag));
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createNote(req, res) {
  try {
    const note = await createNoteForUser(req.user.id, req.body || {});
    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNote(req, res) {
  try {
    const note = await getNoteByIdAndUser(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateNote(req, res) {
  try {
    const existing = await getNoteByIdAndUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const patch = req.body || {};
    const note = await updateNoteById(req.params.id, patch);
    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteNote(req, res) {
  try {
    await deleteNoteById(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function generateAI(req, res) {
  try {
    const note = await getNoteByIdAndUser(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Not found' });

    const ai = await generateNoteAI({ title: note.title, tags: note.tags, description: note.content });
    await updateNoteById(req.params.id, {
      ai_summary: ai.summary,
      ai_action_items: ai.action_items,
      ai_suggested_title: ai.suggested_title,
      ai_uses: (note.ai_uses || 0) + 1,
    });
    res.json(ai);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function shareNote(req, res) {
  try {
    const note = await getNoteByIdAndUser(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Not found' });

    const shareId = note.share_id || nanoid(12);
    await setShareId(req.params.id, shareId);
    res.json({ share_id: shareId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function unshareNote(req, res) {
  try {
    await removeShareId(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSharedNote(req, res) {
  try {
    const note = await getSharedNoteByShareId(req.params.shareId);
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json({ note: {
        title: note.title,
        content: note.content,
        tags: note.tags,
        updated_at: note.updated_at,
        ai: note.ai,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
