import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithEmailPassword, issueMobileAccessToken } from '@/lib/mobile-auth';
import { corsPreflight, jsonError, withCors } from '@/lib/mobile-api';

interface LoginRequestBody {
  email?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as LoginRequestBody | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? '';

  if (!email || !password) {
    return jsonError('Email and password are required.');
  }

  const user = await authenticateWithEmailPassword(email, password);
  if (!user) {
    return jsonError('Invalid email or password.', 401);
  }

  return withCors(NextResponse.json({
    success: true,
    token: issueMobileAccessToken(user),
    user,
  }));
}

export async function OPTIONS() {
  return corsPreflight();
}
