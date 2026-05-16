import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-[0_1px_30px_-18px_rgba(15,23,42,0.8)]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">Peblo Notes</Link>
          <span className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-200">AI notebook</span>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <Link to="/" className="rounded-full px-3 py-2 hover:bg-slate-800 transition">Notes</Link>
          <Link to="/insights" className="rounded-full px-3 py-2 hover:bg-slate-800 transition">Insights</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
              {user.name}
            </span>
          )}
          <button
            onClick={() => { logout(); nav('/login'); }}
            className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
