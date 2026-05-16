export function serializeNote(row) {
  if (!row) return null;
  return {
    note_id: row.id,
    title: row.title,
    content: row.content,
    tags: JSON.parse(row.tags || '[]'),
    category: row.category,
    archived: !!row.archived,
    share_id: row.share_id,
    ai: {
      summary: row.ai_summary || '',
      action_items: JSON.parse(row.ai_action_items || '[]'),
      suggested_title: row.ai_suggested_title || '',
    },
    ai_uses: row.ai_uses || 0,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}
