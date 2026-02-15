import { NextRequest, NextResponse } from 'next/server';
import { archiveAllItems, deleteAllArchivedItems } from '@/lib/db';
import { corsPreflight, jsonError, requireMobileUser, withCors } from '@/lib/mobile-api';

export async function POST(request: NextRequest) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const count = await archiveAllItems(user.id);
  return withCors(NextResponse.json({ success: true, count }));
}

export async function DELETE(request: NextRequest) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const count = await deleteAllArchivedItems(user.id);
  return withCors(NextResponse.json({ success: true, count }));
}

export async function OPTIONS() {
  return corsPreflight();
}
