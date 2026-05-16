import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { serializeNote } from '../utils/serializeNote.js';

export async function listNotesForUser(userId, archived = false) {
  const res = await db.query(
    'SELECT * FROM notes WHERE user_id = $1 AND archived = $2 ORDER BY updated_at DESC',
    [userId, archived ? 1 : 0]
  );
  return res.rows.map(serializeNote);
}

export async function createNoteForUser(userId, { title = '', content = '', tags = [], category = '' }) {
  const id = 'NOTE_' + nanoid(10);
  await db.query(
    'INSERT INTO notes (id, user_id, title, content, tags, category) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, userId, title, content, JSON.stringify(tags), category]
  );
  return getNoteById(id);
}

export async function getNoteById(id) {
  const res = await db.query('SELECT * FROM notes WHERE id = $1', [id]);
  return serializeNote(res.rows[0]);
}

export async function getNoteByIdAndUser(id, userId) {
  const res = await db.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
  return serializeNote(res.rows[0]);
}

export async function updateNoteById(id, patch) {
  const fields = [];
  const values = [];
  let index = 1;

  if (patch.title !== undefined) { fields.push(`title = $${index++}`); values.push(patch.title); }
  if (patch.content !== undefined) { fields.push(`content = $${index++}`); values.push(patch.content); }
  if (patch.tags !== undefined) { fields.push(`tags = $${index++}`); values.push(JSON.stringify(Array.isArray(patch.tags) ? patch.tags : [])); }
  if (patch.category !== undefined) { fields.push(`category = $${index++}`); values.push(patch.category); }
  if (patch.archived !== undefined) { fields.push(`archived = $${index++}`); values.push(patch.archived ? 1 : 0); }
  if (patch.ai_summary !== undefined) { fields.push(`ai_summary = $${index++}`); values.push(patch.ai_summary); }
  if (patch.ai_action_items !== undefined) { fields.push(`ai_action_items = $${index++}`); values.push(JSON.stringify(Array.isArray(patch.ai_action_items) ? patch.ai_action_items : [])); }
  if (patch.ai_suggested_title !== undefined) { fields.push(`ai_suggested_title = $${index++}`); values.push(patch.ai_suggested_title); }
  if (patch.ai_uses !== undefined) { fields.push(`ai_uses = $${index++}`); values.push(patch.ai_uses); }
  
  if (fields.length === 0) return getNoteById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  values.push(id);
  const idIndex = index;

  await db.query(`UPDATE notes SET ${fields.join(', ')} WHERE id = $${idIndex}`, values);
  return getNoteById(id);
}

export async function deleteNoteById(id, userId) {
  await db.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function setShareId(id, shareId) {
  await db.query('UPDATE notes SET share_id = $1 WHERE id = $2', [shareId, id]);
}

export async function removeShareId(id, userId) {
  await db.query('UPDATE notes SET share_id = NULL WHERE id = $1 AND user_id = $2', [id, userId]);
}

export async function getSharedNoteByShareId(shareId) {
  const res = await db.query('SELECT * FROM notes WHERE share_id = $1', [shareId]);
  return serializeNote(res.rows[0]);
}

export async function getAllNotesForUser(userId) {
  const res = await db.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
  return res.rows.map(serializeNote);
}
