import { db } from '../db.js';

export async function findUserByEmail(email) {
  const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

export async function createUser(user, passwordHash) {
  await db.query(
    'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
    [user.id, user.name, user.email, passwordHash]
  );
}
