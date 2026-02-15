import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithGoogleIdToken, issueMobileAccessToken } from '@/lib/mobile-auth';
import { corsPreflight, jsonError, withCors } from '@/lib/mobile-api';

interface GoogleRequestBody {
  idToken?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as GoogleRequestBody | null;
  const idToken = body?.idToken?.trim();
  if (!idToken) {
    return jsonError('Google id token is required.');
  }

  const user = await authenticateWithGoogleIdToken(idToken);
  if (!user) {
    return jsonError('Invalid Google sign in token.', 401);
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
