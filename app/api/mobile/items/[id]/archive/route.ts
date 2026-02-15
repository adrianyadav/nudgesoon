import { NextRequest, NextResponse } from 'next/server';
import { archiveItem } from '@/lib/db';
import { corsPreflight, jsonError, requireMobileUser, withCors } from '@/lib/mobile-api';

function parseItemId(idParam: string): number | null {
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const { id: idParam } = await context.params;
  const id = parseItemId(idParam);
  if (!id) return jsonError('Invalid item id.');

  const archived = await archiveItem(id, user.id);
  if (!archived) {
    return jsonError('Item not found or access denied.', 404);
  }

  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return corsPreflight();
}
