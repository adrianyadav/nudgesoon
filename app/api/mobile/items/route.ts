import { NextRequest, NextResponse } from 'next/server';
import { createItem, getAllItems, getArchivedItems } from '@/lib/db';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { corsPreflight, jsonError, requireMobileUser, withCors } from '@/lib/mobile-api';

interface CreateItemBody {
  name?: string;
  expiry_date?: string;
}

export async function GET(request: NextRequest) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const archived = request.nextUrl.searchParams.get('archived') === 'true';
  const items = archived ? await getArchivedItems(user.id) : await getAllItems(user.id);

  return withCors(NextResponse.json({
    success: true,
    items: items.map(enrichItemWithStatus),
  }));
}

export async function POST(request: NextRequest) {
  const user = requireMobileUser(request);
  if (!user) return jsonError('Not authenticated.', 401);

  const body = (await request.json().catch(() => null)) as CreateItemBody | null;
  const name = body?.name?.trim();
  const expiryDate = body?.expiry_date;
  if (!name || !expiryDate) {
    return jsonError('Name and expiry_date are required.');
  }

  const item = await createItem(name, expiryDate, user.id);
  return withCors(NextResponse.json({
    success: true,
    item: enrichItemWithStatus(item),
  }));
}

export async function OPTIONS() {
  return corsPreflight();
}
