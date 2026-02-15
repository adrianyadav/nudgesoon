import { NextRequest, NextResponse } from 'next/server';
import { corsPreflight, requireMobileUser, jsonError, withCors } from '@/lib/mobile-api';

export async function GET(request: NextRequest) {
  const user = requireMobileUser(request);
  if (!user) {
    return jsonError('Not authenticated.', 401);
  }

  return withCors(NextResponse.json({
    success: true,
    user: {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
    },
  }));
}

export async function OPTIONS() {
  return corsPreflight();
}
