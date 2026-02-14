'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExpiryItemForm } from '@/components/expiry-item-form';
import { ExpiryItemList } from '@/components/expiry-item-list';
import { Navbar } from '@/components/navbar';
import { getItemsAction } from '@/app/actions/item-actions';
import { ExpiryItemWithStatus } from '@/lib/types';
import { enrichItemWithStatus } from '@/lib/expiry-utils';

export function Dashboard() {
  const [items, setItems] = useState<ExpiryItemWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    const data = await getItemsAction();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleItemUpdated = useCallback((updated: ExpiryItemWithStatus) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updated.id ? enrichItemWithStatus(updated) : i))
    );
  }, []);

  return (
    <div className="min-h-screen bg-background grain mesh-gradient dot-pattern relative overflow-hidden">
      <Navbar />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl float-slow" />
      <div className="blob blob-2 float-medium" />

      {/* Abstract line shapes */}
      <div className="absolute top-1/4 right-[5%] w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-1/3 left-[8%] w-24 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Add form - always in "add" mode; edit happens in modal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <ExpiryItemForm
            onItemCreated={loadItems}
          />
        </motion.div>

        {/* Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-12 h-12 border-4 border-border border-t-primary rounded-full"
              />
              <p className="text-gray-500 mt-4">Loading your items...</p>
            </div>
          ) : (
            <ExpiryItemList
              items={items}
              onItemsChange={loadItems}
              onItemUpdated={handleItemUpdated}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
