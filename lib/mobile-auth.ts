import bcrypt from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { createOAuthUser, getUserByEmail } from '@/lib/db';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

interface MobileTokenPayload {
  sub: string;
  email: string;
  name: string | null;
  exp: number;
}

interface GoogleTokenInfoResponse {
  email?: string;
  email_verified?: string;
  name?: string;
  aud?: string;
}

export interface MobileAuthUser {
  id: string;
  email: string;
  name: string | null;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getMobileJwtSecret(): string {
  return process.env.MOBILE_JWT_SECRET ?? process.env.AUTH_SECRET ?? '';
}

function assertMobileJwtSecret(): string {
  const secret = getMobileJwtSecret().trim();
  if (!secret) {
    throw new Error('MOBILE_JWT_SECRET (or AUTH_SECRET) is required for mobile auth.');
  }
  return secret;
}

function hmacSha256(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function issueMobileAccessToken(user: MobileAuthUser): string {
  const secret = assertMobileJwtSecret();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: MobileTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = hmacSha256(`${header}.${payloadEncoded}`, secret);
  return `${header}.${payloadEncoded}.${signature}`;
}

export function verifyMobileAccessToken(token: string): MobileAuthUser | null {
  const secret = getMobileJwtSecret().trim();
  if (!secret) return null;

  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const expectedSignature = hmacSha256(`${header}.${payload}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(base64UrlDecode(payload)) as MobileTokenPayload;
    if (typeof decodedPayload.exp !== 'number' || decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!decodedPayload.sub || !decodedPayload.email) {
      return null;
    }
    return {
      id: decodedPayload.sub,
      email: decodedPayload.email,
      name: decodedPayload.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function authenticateWithEmailPassword(email: string, password: string): Promise<MobileAuthUser | null> {
  const user = await getUserByEmail(email);
  if (!user?.password_hash) return null;
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return null;
  return {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
  };
}

export async function authenticateWithGoogleIdToken(idToken: string): Promise<MobileAuthUser | null> {
  const response = await fetch(`${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) return null;

  const tokenInfo = (await response.json()) as GoogleTokenInfoResponse;
  if (!tokenInfo.email || tokenInfo.email_verified !== 'true') return null;

  // Optional audience validation if client id is configured.
  const expectedAud = process.env.AUTH_GOOGLE_ID;
  if (expectedAud && tokenInfo.aud !== expectedAud) {
    return null;
  }

  let dbUser = await getUserByEmail(tokenInfo.email);
  if (!dbUser) {
    try {
      dbUser = await createOAuthUser(tokenInfo.email, tokenInfo.name);
    } catch (createError: unknown) {
      const pgError = createError as { code?: string };
      if (pgError.code === '23505') {
        dbUser = await getUserByEmail(tokenInfo.email);
      } else {
        throw createError;
      }
    }
  }

  if (!dbUser) return null;

  return {
    id: dbUser.id.toString(),
    email: dbUser.email,
    name: dbUser.name,
  };
}
