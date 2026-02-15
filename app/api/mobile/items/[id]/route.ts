import { NextRequest, NextResponse } from 'next/server';
import { deleteItem, updateItem } from '@/lib/db';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { corsPreflight, jsonError, requireMobileUser, withCors } from '@/lib/mobile-api';

interface UpdateItemBody {
  name?: string;
  expiry_date?: string;
}

function parseItemId(idParam: string): number | null {
  const id = Number.parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const { id: idParam } = await context.params;
  const id = parseItemId(idParam);
  if (!id) return jsonError('Invalid item id.');

  const body = (await request.json().catch(() => null)) as UpdateItemBody | null;
  const name = body?.name?.trim();
  const expiryDate = body?.expiry_date;
  if (!name || !expiryDate) {
    return jsonError('Name and expiry_date are required.');
  }

  const item = await updateItem(id, name, expiryDate, user.id);
  if (!item) {
    return jsonError('Item not found or access denied.', 404);
  }

  return withCors(NextResponse.json({
    success: true,
    item: enrichItemWithStatus(item),
  }));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const { id: idParam } = await context.params;
  const id = parseItemId(idParam);
  if (!id) return jsonError('Invalid item id.');

  const deleted = await deleteItem(id, user.id);
  if (!deleted) {
    return jsonError('Item not found or access denied.', 404);
  }

  return withCors(NextResponse.json({ success: true }));
}

export async function OPTIONS() {
  return corsPreflight();
}
