import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function SharedNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/shared/' + shareId)
      .then(d => setNote(d.note))
      .catch(() => setErr('Note not found.'));
  }, [shareId]);

  if (err) return <div className="min-h-screen p-8 text-center text-slate-400">{err}</div>;
  if (!note) return <div className="min-h-screen p-8 text-slate-200">Loading…</div>;

  return (
    <main className="min-h-screen bg-slate-950/50 py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="text-sm uppercase tracking-[0.32em] text-indigo-300">Shared note</div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold text-white">{note.title || 'Untitled'}</h1>
          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <span key={tag} className="max-w-full break-words rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">#{tag}</span>
            ))}
          </div>
        </div>
        <article className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-7 leading-7 text-slate-200 whitespace-pre-wrap">
          {note.content || 'No content available.'}
        </article>
        {note.ai?.summary && (
          <section className="rounded-[1.5rem] border border-indigo-500/10 bg-indigo-500/10 p-6 text-slate-100">
            <h2 className="text-xl font-semibold text-white">AI summary</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">{note.ai.summary}</p>
          </section>
        )}
      </div>
    </main>
  );
}
