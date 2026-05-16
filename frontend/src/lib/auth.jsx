import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('peblo_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('peblo_token'));

  useEffect(() => {
    if (token) localStorage.setItem('peblo_token', token); else localStorage.removeItem('peblo_token');
    if (user) localStorage.setItem('peblo_user', JSON.stringify(user)); else localStorage.removeItem('peblo_user');
  }, [user, token]);

  async function login(email, password) {
    const { user, token } = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(user); setToken(token);
  }
  async function signup(name, email, password) {
    const { user, token } = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
    setUser(user); setToken(token);
  }
  function logout() { setUser(null); setToken(null); }

  return <Ctx.Provider value={{ user, token, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
