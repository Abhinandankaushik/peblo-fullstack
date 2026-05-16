import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { signToken } from '../middleware/authMiddleware.js';

export async function signup(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = 'USR_' + nanoid(10);
  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({ id, name, email }, passwordHash);

  const user = { id, name, email };
  res.json({ user, token: signToken(user) });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  const row = await findUserByEmail(email);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ user, token: signToken(user) });
}
