'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpiryItemForm } from '@/components/expiry-item-form';
import { ExpiryItemList } from '@/components/expiry-item-list';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { getItemsAction, getArchivedItemsAction } from '@/app/actions/item-actions';
import { ExpiryItemWithStatus } from '@/lib/types';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { Archive, ChevronDown } from 'lucide-react';

export function Dashboard() {
  const [items, setItems] = useState<ExpiryItemWithStatus[]>([]);
  const [archivedItems, setArchivedItems] = useState<ExpiryItemWithStatus[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    const [activeData, archivedData] = await Promise.all([
      getItemsAction(),
      getArchivedItemsAction(),
    ]);
    setItems(activeData);
    setArchivedItems(archivedData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // loadItems performs async fetches and then sets state on completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, [loadItems]);

  const handleItemUpdated = useCallback((updated: ExpiryItemWithStatus) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? enrichItemWithStatus(updated) : i))
    );
    setArchivedItems((prev) =>
      prev.map((i) => (i.id === updated.id ? enrichItemWithStatus(updated) : i))
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background grain mesh-gradient dot-pattern relative overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-slow" />
      <div className="blob blob-2 float-medium" />

      {/* Abstract line shapes */}
      <div className="absolute top-1/4 right-[5%] w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1/3 left-[8%] w-24 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Add form */}
        <div className="mb-8">
          <ExpiryItemForm onItemCreated={loadItems} />
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
              items={items}
              onItemsChange={loadItems}
              onItemUpdated={handleItemUpdated}
              mode="active"
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
              {archivedItems.length > 0 && (
                <span className="text-sm opacity-90">({archivedItems.length})</span>
              )}
              <ChevronDown className={`size-4 transition-transform ${showArchive ? 'rotate-180' : ''}`} />
            </button>

            {showArchive && (
              <div className="mt-4">
                <ExpiryItemList
                  items={archivedItems}
                  onItemsChange={loadItems}
                  onItemUpdated={handleItemUpdated}
                  mode="archive"
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
