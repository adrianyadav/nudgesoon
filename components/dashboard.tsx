'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExpiryItemForm } from '@/components/expiry-item-form';
import { ExpiryItemList } from '@/components/expiry-item-list';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getItemsAction, getArchivedItemsAction } from '@/app/actions/item-actions';
import { ExpiryItem, ExpiryItemWithStatus } from '@/lib/types';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { loadGuestItems, saveGuestItems } from '@/lib/guest-storage';
import { Archive, ChevronDown } from 'lucide-react';

interface DashboardProps {
  isGuest?: boolean;
  onExitGuestMode?: () => void;
}

export function Dashboard({ isGuest = false, onExitGuestMode }: DashboardProps) {
  const [items, setItems] = useState<ExpiryItemWithStatus[]>([]);
  const [archivedItems, setArchivedItems] = useState<ExpiryItemWithStatus[]>([]);
  const [guestItems, setGuestItems] = useState<ExpiryItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);

    if (isGuest) {
      setGuestItems(loadGuestItems());
      setIsLoading(false);
      return;
    }

    const [activeData, archivedData] = await Promise.all([getItemsAction(), getArchivedItemsAction()]);
    setItems(activeData);
    setArchivedItems(archivedData);
    setIsLoading(false);
  }, [isGuest]);

  useEffect(() => {
    // loadItems performs async fetches and then sets state on completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!isGuest) return;
    saveGuestItems(guestItems);
  }, [guestItems, isGuest]);

  const activeItems = useMemo(() => {
    if (!isGuest) return items;
    return guestItems.filter((item) => !item.archived_at).map(enrichItemWithStatus);
  }, [guestItems, isGuest, items]);

  const archivedDisplayItems = useMemo(() => {
    if (!isGuest) return archivedItems;
    return guestItems.filter((item) => Boolean(item.archived_at)).map(enrichItemWithStatus);
  }, [archivedItems, guestItems, isGuest]);

  const handleItemUpdated = useCallback((updated: ExpiryItemWithStatus) => {
    const enriched = enrichItemWithStatus(updated);
    const targetIsArchived = Boolean(enriched.archived_at);

    setItems((prev) => {
      const withoutItem = prev.filter((i) => i.id !== enriched.id);
      if (targetIsArchived) {
        return withoutItem;
      }
      return [...withoutItem, enriched];
    });

    setArchivedItems((prev) => {
      const withoutItem = prev.filter((i) => i.id !== enriched.id);
      if (!targetIsArchived) {
        return withoutItem;
      }
      return [enriched, ...withoutItem];
    });
  }, []);

  const handleItemCreateOptimistic = useCallback((optimistic: ExpiryItemWithStatus) => {
    setItems((prev) => [...prev.filter((i) => i.id !== optimistic.id), optimistic]);
  }, []);

  const handleItemCreateCommitted = useCallback(
    (tempId: number, saved: ExpiryItemWithStatus) => {
      setItems((prev) => {
        const withoutTemp = prev.filter((i) => i.id !== tempId && i.id !== saved.id);
        return [...withoutTemp, enrichItemWithStatus(saved)];
      });
    },
    []
  );

  const handleItemCreateFailed = useCallback((tempId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== tempId));
  }, []);

  const handleGuestCreateItem = useCallback(async (name: string, expiryDate: string) => {
    const nowIso = new Date().toISOString();
    const createdItem: ExpiryItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name,
      expiry_date: expiryDate,
      user_id: null,
      archived_at: null,
      created_at: nowIso,
      updated_at: nowIso,
    };
    setGuestItems((prev) => [createdItem, ...prev]);
    return enrichItemWithStatus(createdItem);
  }, []);

  const handleGuestUpdateItem = useCallback(async (id: number, name: string, expiryDate: string) => {
    const nowIso = new Date().toISOString();
    let updatedItem: ExpiryItem | null = null;
    setGuestItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        updatedItem = { ...item, name, expiry_date: expiryDate, updated_at: nowIso };
        return updatedItem;
      })
    );
    return updatedItem ? enrichItemWithStatus(updatedItem) : null;
  }, []);

  const handleGuestArchiveItem = useCallback(async (id: number) => {
    const nowIso = new Date().toISOString();
    setGuestItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, archived_at: nowIso, updated_at: nowIso };
      })
    );
  }, []);

  const handleGuestDeleteArchivedItem = useCallback(async (id: number) => {
    setGuestItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleGuestArchiveAllItems = useCallback(async () => {
    const nowIso = new Date().toISOString();
    setGuestItems((prev) =>
      prev.map((item) => {
        if (item.archived_at) return item;
        return { ...item, archived_at: nowIso, updated_at: nowIso };
      })
    );
  }, []);

  const handleGuestDeleteAllArchivedItems = useCallback(async () => {
    setGuestItems((prev) => prev.filter((item) => !item.archived_at));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background grain mesh-gradient dot-pattern relative overflow-hidden">
      <Navbar isGuest={isGuest} onExitGuestMode={onExitGuestMode} />

      <div className="flex-1 flex flex-col relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-slow" />
      <div className="blob blob-2 float-medium" />

      {/* Abstract line shapes */}
      <div className="absolute top-1/4 right-[5%] w-px h-32 bg-linear-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1/3 left-[8%] w-24 h-px bg-linear-to-r from-transparent via-primary/15 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {isGuest && (
          <div className="mb-6 rounded-xl border border-amber-300/70 bg-amber-50/90 px-4 py-3 text-amber-900 shadow-sm">
            <p className="text-sm font-medium">
              You are in guest mode. Your data is stored only in this browser&apos;s local storage and
              is not permanently saved to an account.
            </p>
            <p className="mt-1 text-xs text-amber-800/90">
              If you clear browser data, switch devices, or use private browsing, your guest data may
              be lost.
            </p>
          </div>
        )}

        {/* Add form */}
        <div className="mb-8">
          <ExpiryItemForm
            onItemCreateOptimistic={isGuest ? undefined : handleItemCreateOptimistic}
            onItemCreateCommitted={isGuest ? undefined : handleItemCreateCommitted}
            onItemCreateFailed={isGuest ? undefined : handleItemCreateFailed}
            onCreateItem={isGuest ? handleGuestCreateItem : undefined}
            onUpdateItem={isGuest ? handleGuestUpdateItem : undefined}
          />
        </div>

        {/* Active Items */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
              <p className="text-gray-500 mt-4">Loading your items...</p>
            </div>
          ) : (
            <ExpiryItemList
              items={activeItems}
              onItemsChange={isGuest ? undefined : loadItems}
              onItemUpdated={isGuest ? undefined : handleItemUpdated}
              mode="active"
              onSaveItem={isGuest ? handleGuestUpdateItem : undefined}
              onArchiveItem={isGuest ? handleGuestArchiveItem : undefined}
              onArchiveAllItems={isGuest ? handleGuestArchiveAllItems : undefined}
            />
          )}
        </div>

        {/* Archive section */}
        {!isLoading && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowArchive((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Archive className="size-4" />
              Archive
              {archivedDisplayItems.length > 0 && (
                <span className="text-sm opacity-90">({archivedDisplayItems.length})</span>
              )}
              <ChevronDown className={`size-4 transition-transform ${showArchive ? 'rotate-180' : ''}`} />
            </button>

            {showArchive && (
              <div className="mt-4">
                <ExpiryItemList
                  items={archivedDisplayItems}
                  onItemsChange={isGuest ? undefined : loadItems}
                  onItemUpdated={isGuest ? undefined : handleItemUpdated}
                  mode="archive"
                  onSaveItem={isGuest ? handleGuestUpdateItem : undefined}
                  onDeleteItem={isGuest ? handleGuestDeleteArchivedItem : undefined}
                  onDeleteAllItems={isGuest ? handleGuestDeleteAllArchivedItems : undefined}
                />
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      <Footer />
    </div>
  );
}
