import { NextResponse } from 'next/server';
import { corsPreflight, withCors } from '@/lib/mobile-api';

export async function POST() {
  // Mobile auth is token-based on client storage; logout is handled client-side.
  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return corsPreflight();
}
