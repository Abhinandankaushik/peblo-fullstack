import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

export default function NoteEditor() {
  const { id } = useParams();
  const { token } = useAuth();
  const nav = useNavigate();
  const [note, setNote] = useState(null);
  const [pendingTag, setPendingTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [notice, setNotice] = useState('');
  const debounce = useRef();

  useEffect(() => {
    api('/notes/' + id, { token }).then(({ note }) => {
      setNote(note);
      setPendingTag('');
      if (note.share_id) setShareUrl(window.location.origin + '/s/' + note.share_id);
    });
  }, [id, token]);

  function update(patch) {
    setNote(n => ({ ...n, ...patch }));
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      await api('/notes/' + id, { method: 'PATCH', token, body: patch });
      setSaving(false);
      setNotice('Saved to disk');
      window.setTimeout(() => setNotice(''), 1200);
    }, 600);
  }

  function parseTags(value) {
    return value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  async function saveTags(tags) {
    setNote(n => ({ ...n, tags }));
    setSaving(true);
    await api('/notes/' + id, { method: 'PATCH', token, body: { tags } });
    setSaving(false);
    setNotice('Tags saved');
    window.setTimeout(() => setNotice(''), 1200);
  }

  function addTagsFromInput(value) {
    const tags = parseTags(value);
    if (tags.length === 0) {
      setPendingTag('');
      return;
    }

    const existing = note.tags || [];
    const combined = [...existing];
    for (const tag of tags) {
      if (!combined.includes(tag)) combined.push(tag);
    }

    saveTags(combined);
    setPendingTag('');
  }

  function handleTagInputChange(e) {
    const value = e.target.value;
    if (value.includes(',')) {
      addTagsFromInput(value);
      return;
    }
    setPendingTag(value);
  }

  function handleTagInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagsFromInput(pendingTag);
    }
  }

  function handleTagInputBlur() {
    addTagsFromInput(pendingTag);
  }

  function removeTag(tag) {
    const next = (note.tags || []).filter(t => t !== tag);
    saveTags(next);
  }

  async function generate() {
    setAiBusy(true);
    try {
      const ai = await api('/notes/' + id + '/generate', { method: 'POST', token });
      setNote(n => ({ ...n, ai }));
    } finally {
      setAiBusy(false);
    }
  }

  async function toggleShare() {
    if (note.share_id) {
      await api('/notes/' + id + '/share', { method: 'DELETE', token });
      setNote(n => ({ ...n, share_id: null }));
      setShareUrl('');
      setNotice('Share link removed');
    } else {
      const { share_id } = await api('/notes/' + id + '/share', { method: 'POST', token });
      const url = window.location.origin + '/s/' + share_id;
      setNote(n => ({ ...n, share_id }));
      setShareUrl(url);
      setNotice('Public link copied');
      navigator.clipboard?.writeText(url);
    }
    window.setTimeout(() => setNotice(''), 1800);
  }

  async function remove() {
    if (!confirm('Delete this note?')) return;
    await api('/notes/' + id, { method: 'DELETE', token });
    nav('/');
  }

  if (!note) return <><Nav /><div className="p-8 text-slate-200">Loading…</div></>;

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button onClick={() => nav('/')} className="text-sm text-indigo-300 hover:text-white">← Back to notes</button>
            <div className="flex-1" />
            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs text-slate-300">{saving ? 'Saving…' : 'Saved'}</span>
            {notice && <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">{notice}</span>}
          </div>
        </div>

        {shareUrl && (
          <div className="glass-panel mb-6 flex flex-col gap-2 rounded-3xl border border-emerald-400/10 p-5 text-slate-200">
            <p className="text-sm">Your note is publicly shared.</p>
            <a href={shareUrl} target="_blank" rel="noreferrer" className="font-medium text-emerald-100 underline break-all">{shareUrl}</a>
          </div>
        )}

        <div className="glass-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              <input
                value={note.title}
                onChange={e => update({ title: e.target.value })}
                placeholder="Note title"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-3xl font-semibold text-white outline-none focus:border-indigo-400"
              />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(note.tags || []).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-100 transition hover:bg-indigo-500/25"
                    >
                      <span className="max-w-full break-words">#{tag}</span>
                      <span className="text-slate-400">×</span>
                    </button>
                  ))}
                </div>
                <input
                  value={pendingTag}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={handleTagInputBlur}
                  placeholder="Add tags with comma or Enter"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleShare}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-indigo-400"
              >
                {note.share_id ? 'Unshare' : 'Share'}
              </button>
              <button
                onClick={remove}
                className="rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>

          <textarea
            value={note.content}
            onChange={e => update({ content: e.target.value })}
            placeholder="Write your note…"
            className="mt-6 h-[420px] w-full rounded-[2rem] border border-white/10 bg-slate-950/80 px-5 py-5 text-slate-100 leading-7 outline-none focus:border-indigo-400"
          />

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">AI insights</h2>
                <p className="mt-1 text-sm text-slate-400">Generate a summary, suggested title, and action items.</p>
              </div>
              <button
                onClick={generate}
                disabled={aiBusy}
                className="ml-auto rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 hover:bg-indigo-400"
              >
                {aiBusy ? 'Generating…' : 'Generate AI'}
              </button>
            </div>

            <div className="mt-6 space-y-4 text-slate-200">
              {note.ai?.summary ? (
                <>
                  <div className="space-y-3 rounded-3xl bg-white/5 p-5">
                    <p className="text-sm text-slate-300"><span className="font-semibold text-white">Summary:</span> {note.ai.summary}</p>
                    {note.ai.suggested_title && (
                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">Suggested title:</span> {note.ai.suggested_title}
                        <button
                          onClick={() => update({ title: note.ai.suggested_title })}
                          className="ml-3 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-indigo-500/20"
                        >
                          Apply
                        </button>
                      </p>
                    )}
                    {note.ai.action_items?.length > 0 && (
                      <div>
                        <p className="font-semibold text-white">Action items</p>
                        <ul className="mt-3 space-y-2 pl-5 text-sm text-slate-300">
                          {note.ai.action_items.map((item, index) => (
                            <li key={index} className="list-disc">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-slate-400">No AI output yet — click Generate AI to get a smart summary.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
