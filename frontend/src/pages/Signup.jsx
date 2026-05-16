import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 p-8 text-white">
          <h1 className="text-3xl font-semibold">Create your space</h1>
          <p className="mt-2 text-slate-200">Register and start turning scattered thoughts into sharp, shareable notes.</p>
        </div>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setErr('');
            try {
              await signup(name, email, password);
              nav('/');
            } catch (e) {
              setErr(e.message);
            }
          }}
          className="p-8 space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400"
            />
          </div>
          {err && <p className="text-sm text-rose-400">{err}</p>}
          <button className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
            Create account
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-300 hover:text-white">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
