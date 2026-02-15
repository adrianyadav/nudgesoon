import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileAccessToken } from '@/lib/mobile-auth';

export interface AuthenticatedMobileUser {
  id: number;
  email: string;
  name: string | null;
}

export function jsonError(message: string, status = 400): NextResponse {
  return withCors(NextResponse.json({ success: false, error: message }, { status }));
}

export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function requireMobileUser(request: NextRequest): AuthenticatedMobileUser | null {
  const token = getBearerToken(request);
  if (!token) return null;

  const user = verifyMobileAccessToken(token);
  if (!user) return null;

  const parsedId = Number.parseInt(user.id, 10);
  if (!Number.isFinite(parsedId) || parsedId <= 0) return null;

  return {
    id: parsedId,
    email: user.email,
    name: user.name,
  };
}

export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function corsPreflight(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}
