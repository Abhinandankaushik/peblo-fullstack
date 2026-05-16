import { getAllNotesForUser } from '../models/noteModel.js';

export async function getInsights(req, res) {
  try {
    const all = await getAllNotesForUser(req.user.id);
    const total = all.length;
    const recent = all
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 5)
      .map(note => ({ id: note.note_id, title: note.title, updated_at: note.updated_at }));

    const tagCount = {};
    let aiUses = 0;
    for (const note of all) {
      aiUses += note.ai_uses || 0;
      for (const tag of note.tags) tagCount[tag] = (tagCount[tag] || 0) + 1;
    }

    const top_tags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    const weekly = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      weekly.push({ day, count: all.filter(note => note.updated_at.startsWith(day)).length });
    }

    res.json({ total, recent, top_tags, ai_uses: aiUses, weekly });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
