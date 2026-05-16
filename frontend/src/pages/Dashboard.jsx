import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

export default function Dashboard() {
  const { token } = useAuth();
  const nav = useNavigate();
  const [notes, setNotes] = useState([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    const { notes } = await api('/notes?' + params, { token });
    setNotes(notes);
  }

  useEffect(() => { load(); }, [q, tag]);

  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach(note => note.tags.forEach(tag => set.add(tag)));
    return [...set];
  }, [notes]);

  const noteCount = notes.length;
  const tagCount = notes.reduce((sum, note) => sum + note.tags.length, 0);

  async function create() {
    const { note } = await api('/notes', {
      method: 'POST',
      token,
      body: { title: 'Untitled note', content: '', tags: [] },
    });
    nav('/notes/' + note.note_id);
  }

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <section className="glass-card p-6 mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-indigo-300">Notes workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Organize your ideas with AI-powered notes</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Search across your notes, filter by tags, and generate summaries or follow-up tasks with a single click.</p>
            </div>
            <button
              onClick={create}
              className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              + New note
            </button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label="Total notes" value={noteCount} />
            <Stat label="Saved tags" value={allTags.length} />
            <Stat label="Tag references" value={tagCount} />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(240px,320px)]">
          <section className="glass-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">Quick search</h2>
                <p className="mt-1 text-sm text-slate-400">Find notes by title, content, or tag.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search title or content…"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-indigo-400"
              />
              <select
                value={tag}
                onChange={e => setTag(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-indigo-400"
              >
                <option value="">All tags</option>
                {allTags.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Tag cloud</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-400">No tags yet</span>
              ) : allTags.map(tag => (
                <span key={tag} className="max-w-full break-words rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-100 whitespace-normal">{tag}</span>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8">
          {noteCount === 0 ? (
            <div className="glass-card p-10 text-center text-slate-300">
              <h2 className="text-2xl font-semibold text-white">Create your first note</h2>
              <p className="mt-2 text-slate-400">Capture ideas, brainstorm, and generate AI summaries in one place.</p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {notes.map(note => (
                <li key={note.note_id}>
                  <Link
                    to={'/notes/' + note.note_id}
                    className="glass-card block h-full p-5 transition hover:-translate-y-1 hover:border-indigo-400"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white truncate">{note.title || 'Untitled'}</h3>
                      {note.share_id && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">Shared</span>}
                    </div>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{note.content || 'No content yet.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="max-w-full break-words rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">#{tag}</span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Updated {new Date(note.updated_at + 'Z').toLocaleString()}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}
