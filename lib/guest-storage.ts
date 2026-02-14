'use client';

import { ExpiryItem } from '@/lib/types';

export const GUEST_MODE_STORAGE_KEY = 'nudge-guest-mode';
export const GUEST_ITEMS_STORAGE_KEY = 'nudge-guest-items';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getGuestMode(): boolean {
  if (!isBrowser()) return false;
  try {
    return localStorage.getItem(GUEST_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setGuestMode(enabled: boolean): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(GUEST_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function loadGuestItems(): ExpiryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(GUEST_ITEMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ExpiryItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.expiry_date === 'string' &&
        (typeof item.user_id === 'number' || item.user_id === null) &&
        (typeof item.archived_at === 'string' || item.archived_at === null) &&
        typeof item.created_at === 'string' &&
        typeof item.updated_at === 'string'
      );
    });
  } catch {
    return [];
  }
}

export function saveGuestItems(items: ExpiryItem[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(GUEST_ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}
