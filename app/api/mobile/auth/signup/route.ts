import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail } from '@/lib/db';
import { issueMobileAccessToken } from '@/lib/mobile-auth';
import { corsPreflight, jsonError, withCors } from '@/lib/mobile-api';

interface SignupRequestBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as SignupRequestBody | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? '';
  const name = body?.name?.trim();

  if (!email || !password) {
    return jsonError('Email and password are required.');
  }
  if (password.length < 6) {
    return jsonError('Password must be at least 6 characters long.');
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return jsonError('User already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const createdUser = await createUser(email, passwordHash, name);
  const mobileUser = {
    id: createdUser.id.toString(),
    email: createdUser.email,
    name: createdUser.name,
  };

  return withCors(NextResponse.json({
    success: true,
    token: issueMobileAccessToken(mobileUser),
    user: mobileUser,
  }));
}

export async function OPTIONS() {
  return corsPreflight();
}
