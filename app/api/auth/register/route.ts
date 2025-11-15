import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/lib/auth';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, firstName, lastName, bankName } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['client', 'bank'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "client" or "bank"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, password, role, firstName, lastName);

    // Create profile based on role
    if (role === 'bank' && bankName) {
      const bankProfileId = randomUUID();
      db.prepare(`
        INSERT INTO bank_profiles (id, user_id, bank_name, contact_email, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(bankProfileId, user.id, bankName, email, new Date().toISOString());
    } else if (role === 'client') {
      const clientProfileId = randomUUID();
      db.prepare(`
        INSERT INTO client_profiles (id, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `).run(clientProfileId, user.id, new Date().toISOString(), new Date().toISOString());
    }

    // Generate token
    const token = generateToken(user);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}

