'use server';

import { revalidatePath } from 'next/cache';
import {
  getAllItems,
  getArchivedItems,
  createItem,
  updateItem,
  deleteItem,
  archiveItem,
  archiveAllItems,
  deleteAllArchivedItems,
} from '@/lib/db';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { ExpiryItemWithStatus } from '@/lib/types';
import { auth } from '@/lib/auth';

export async function getItemsAction(): Promise<ExpiryItemWithStatus[]> {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined;
  const items = await getAllItems(userId);
  return items.map(enrichItemWithStatus);
}

export async function getArchivedItemsAction(): Promise<ExpiryItemWithStatus[]> {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined;
  const items = await getArchivedItems(userId);
  return items.map(enrichItemWithStatus);
}

export async function createItemAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const expiryDate = formData.get('expiry_date') as string;

  if (!name || !expiryDate) {
    return { success: false, error: 'Name and expiry date are required' };
  }

  try {
    const userId = parseInt(session.user.id);
    const item = await createItem(name, expiryDate, userId);
    revalidatePath('/');
    return { success: true, item };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateItemAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const expiryDate = formData.get('expiry_date') as string;

  if (!id || !name || !expiryDate) {
    return { success: false, error: 'Invalid data' };
  }

  try {
    const item = await updateItem(id, name, expiryDate);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    revalidatePath('/');
    return { success: true, item };
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function archiveItemAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);

  if (!id) {
    return { success: false, error: 'Invalid ID' };
  }

  try {
    await archiveItem(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error archiving item:', error);
    return { success: false, error: 'Failed to archive item' };
  }
}

export async function archiveAllItemsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const userId = parseInt(session.user.id);
    const count = await archiveAllItems(userId);
    revalidatePath('/');
    return { success: true, count };
  } catch (error) {
    console.error('Error archiving all items:', error);
    return { success: false, error: 'Failed to archive items' };
  }
}

export async function deleteAllItemsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const userId = parseInt(session.user.id);
    const count = await deleteAllArchivedItems(userId);
    revalidatePath('/');
    return { success: true, count };
  } catch (error) {
    console.error('Error deleting all items:', error);
    return { success: false, error: 'Failed to delete items' };
  }
}

export async function deleteItemAction(formData: FormData) {
  const id = parseInt(formData.get('id') as string);

  if (!id) {
    return { success: false, error: 'Invalid ID' };
  }

  try {
    await deleteItem(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

