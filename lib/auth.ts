import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  role: 'client' | 'bank' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function createUser(
  email: string,
  password: string,
  role: 'client' | 'bank' | 'admin',
  firstName?: string,
  lastName?: string
): Promise<AuthUser> {
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email, passwordHash, role, firstName || null, lastName || null, now, now);

  return { id: userId, email, role };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email) as
    | {
        id: string;
        email: string;
        password_hash: string;
        role: string;
      }
    | undefined;

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email, role: user.role as 'client' | 'bank' | 'admin' };
}

export function getUserById(userId: string): AuthUser | null {
  const user = db
    .prepare('SELECT id, email, role FROM users WHERE id = ?')
    .get(userId) as
    | { id: string; email: string; role: string }
    | undefined;

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email, role: user.role as 'client' | 'bank' | 'admin' };
}

