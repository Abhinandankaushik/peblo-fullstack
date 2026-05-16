import { useEffect, useState } from 'react';
import Nav from '../components/Nav.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

export default function Insights() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/insights', { token }).then(setData);
  }, [token]);

  if (!data) return <><Nav /><div className="p-8 text-slate-200">Loading…</div></>;

  const max = Math.max(1, ...data.weekly.map(d => d.count));

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="glass-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Performance</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Productivity insights</h1>
              <p className="mt-2 text-slate-300">Track your note activity, AI usage, and top tags at a glance.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Total notes" value={data.total} />
            <Stat label="AI generations" value={data.ai_uses} />
            <Stat label="Top tags" value={data.top_tags.length} />
          </div>
        </div>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Weekly activity</h2>
              <p className="mt-1 text-sm text-slate-400">Notes updated in the last 7 days.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-7 items-end">
            {data.weekly.map(day => (
              <div key={day.day} className="flex flex-col items-center gap-2">
                <div
                  className="h-40 w-full rounded-full bg-gradient-to-t from-indigo-500 to-indigo-300 transition-all"
                  style={{ height: `${(day.count / max) * 100}%` }}
                  title={`${day.count} updates`}
                />
                <span className="text-[10px] text-slate-400">{day.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Recently edited</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              {data.recent.length > 0 ? data.recent.map(item => (
                <li key={item.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-white">{item.title || 'Untitled'}</span>
                    <span className="text-xs text-slate-400">{new Date(item.updated_at + 'Z').toLocaleDateString()}</span>
                  </div>
                </li>
              )) : <li className="text-slate-500">No recent edits yet.</li>}
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Top tags</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              {data.top_tags.length > 0 ? data.top_tags.map(tag => (
                <li key={tag.tag} className="flex min-w-0 items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <span className="min-w-0 max-w-full truncate text-indigo-200">#{tag.tag}</span>
                  <span className="ml-3 flex-shrink-0 text-sm text-slate-400">{tag.count}</span>
                </li>
              )) : <li className="text-slate-500">Create notes with tags to surface insights here.</li>}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
      <p className="text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}
