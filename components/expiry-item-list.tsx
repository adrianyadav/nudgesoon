'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpiryItemWithStatus, ExpiryStatus } from '@/lib/types';
import { ExpiryItemCard } from './expiry-item-card';
import { deleteItemAction, deleteAllItemsAction } from '@/app/actions/item-actions';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Trash2, type LucideIcon } from 'lucide-react';

interface ExpiryItemListProps {
  items: ExpiryItemWithStatus[];
  onItemsChange?: () => void;
}

const STATUS_FILTERS: {
  status: ExpiryStatus;
  label: string;
  icon: LucideIcon;
  activeClass: string;
  badgeActiveClass: string;
}[] = [

  {
    status: 'critical',
    label: 'Critical',
    icon: AlertTriangle,
    activeClass: 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-200 hover:bg-red-200 hover:text-red-900 hover:border-red-300',
    badgeActiveClass: 'bg-red-200 text-red-800',
  },
  {
    status: 'approaching',
    label: 'Approaching',
    icon: Clock,
    activeClass: 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200 hover:bg-amber-200 hover:text-amber-900 hover:border-amber-300',
    badgeActiveClass: 'bg-amber-200 text-amber-800',
  },
  {
    status: 'safe',
    label: 'Safe',
    icon: CheckCircle2,
    activeClass: 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-200 hover:bg-green-200 hover:text-green-900 hover:border-green-300',
    badgeActiveClass: 'bg-green-200 text-green-800',
  },
  
];

/** Sort by expiry date ascending (soonest to expire first) */
function sortByExpiryDate(items: ExpiryItemWithStatus[]): ExpiryItemWithStatus[] {
  return [...items].sort(
    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );
}

/** Default filters: critical only if any exist, else approaching only. Safe only when user clicks it. */
function getDefaultFilters(items: ExpiryItemWithStatus[]): Record<ExpiryStatus, boolean> {
  const criticalCount = items.filter((i) => i.status === 'critical').length;
  const approachingCount = items.filter((i) => i.status === 'approaching').length;
  if (criticalCount > 0) return { safe: false, approaching: false, critical: true };
  if (approachingCount > 0) return { safe: false, approaching: true, critical: false };
  return { safe: true, approaching: false, critical: false };
}

const FILTERS_STORAGE_KEY = 'nudge-status-filters';

function loadSavedFilters(): Record<ExpiryStatus, boolean> | null {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (
      typeof parsed.safe === 'boolean' &&
      typeof parsed.approaching === 'boolean' &&
      typeof parsed.critical === 'boolean'
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

function saveFilters(filters: Record<ExpiryStatus, boolean>) {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {}
}

export function ExpiryItemList({ items, onItemsChange }: ExpiryItemListProps) {
  const [statusFilters, setStatusFilters] = useState<Record<ExpiryStatus, boolean>>({
    safe: true,
    approaching: true,
    critical: true,
  });
  const hasInitializedFilters = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useLayoutEffect(() => {
    if (items.length === 0) {
      hasInitializedFilters.current = false;
    } else if (!hasInitializedFilters.current) {
      const saved = loadSavedFilters();
      setStatusFilters(saved ?? getDefaultFilters(items));
      hasInitializedFilters.current = true;
    }
  }, [items]);

  const sortedItems = sortByExpiryDate(items);
  const filteredItems = sortedItems.filter((item) => statusFilters[item.status]);

  const toggleFilter = (status: ExpiryStatus) => {
    setStatusFilters((prev) => {
      const next = { ...prev, [status]: !prev[status] };
      saveFilters(next);
      return next;
    });
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    setShowDeleteAll(false);
    await deleteAllItemsAction();
    setIsDeletingAll(false);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    const formData = new FormData();
    formData.append('id', id.toString());
    startTransition(async () => {
      await deleteItemAction(formData);
      window.location.reload();
    });
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border bg-card/90 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <CardContent className="text-center py-16 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <svg width="160" height="160" viewBox="0 0 200 200" fill="none" className="mx-auto float-medium">
                <rect x="40" y="50" width="120" height="130" rx="12" fill="#F0F9FF" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                <rect x="40" y="50" width="120" height="30" rx="12" fill="currentColor" className="text-primary"/>
                <circle cx="70" cy="45" r="5" fill="currentColor" className="text-primary/70"/>
                <circle cx="130" cy="45" r="5" fill="currentColor" className="text-primary/70"/>
                <line x1="60" y1="100" x2="90" y2="100" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                <line x1="110" y1="100" x2="140" y2="100" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                <line x1="60" y1="120" x2="90" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                <line x1="110" y1="120" x2="140" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                <line x1="60" y1="140" x2="90" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary"/>
                <path d="M150,-10 L152,-2 L160,0 L152,2 L150,10 L148,2 L140,0 L148,-2 Z" fill="currentColor" className="text-primary" transform="translate(0, 90)"/>
                <path d="M0,-6 L1.5,-1.5 L6,0 L1.5,1.5 L0,6 L-1.5,1.5 L-6,0 L-1.5,-1.5 Z" fill="currentColor" className="text-primary/60" transform="translate(45, 160)"/>
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-700 text-xl mb-2 font-medium"
            >
              No items yet
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm"
            >
              Add your first item above to start tracking! ✨
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const criticalCount = items.filter((i) => i.status === 'critical').length;
  const countByStatus = (s: ExpiryStatus) => items.filter((i) => i.status === s).length;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <p className="text-sm text-gray-600 font-medium">
          {items.length} {items.length === 1 ? 'item' : 'items'} tracked · soonest to expire first
        </p>
        <div className="h-1 w-1 rounded-full bg-primary" />
        <p className="text-xs text-gray-500">{criticalCount} critical</p>
      </motion.div>

      {/* Status filters & actions */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center gap-2"
      >
        {STATUS_FILTERS.map(({ status, label, icon: Icon, activeClass, badgeActiveClass }) => (
          <Button
            key={status}
            type="button"
            variant="outline"
            size="sm"
            className={`border transition-all duration-200 ${
              statusFilters[status]
                ? activeClass
                : 'border-border bg-muted/50 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted hover:text-foreground'
            }`}
            onClick={() => toggleFilter(status)}
          >
            <Icon className="size-4 shrink-0" />
            <span className="font-medium">{label}</span>
            <Badge
              variant="secondary"
              className={`ml-2 font-semibold ${
                statusFilters[status] ? badgeActiveClass : 'bg-muted text-muted-foreground'
              }`}
            >
              {countByStatus(status)}
            </Badge>
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeletingAll}
          onClick={() => setShowDeleteAll(true)}
          className="ml-auto text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4 shrink-0" />
          <span className="hidden sm:inline">Delete All</span>
        </Button>
      </motion.div>

      <ConfirmDialog
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={handleDeleteAll}
        title="Delete all items?"
        description={`This will permanently remove all ${items.length} items. This action cannot be undone.`}
        confirmLabel="Delete All"
        isPending={isDeletingAll}
      />

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ExpiryItemCard item={item} onDelete={handleDelete} onDateUpdated={onItemsChange} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
