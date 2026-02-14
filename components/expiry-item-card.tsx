'use client';

import { ExpiryItemWithStatus } from '@/lib/types';
import { getStatusColors } from '@/lib/expiry-utils';
import { getItemIcon, getItemAccent, getAccentCardColors, getCardImage } from '@/lib/item-icons';
import Image from 'next/image';
import { useState, useCallback, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { updateItemAction } from '@/app/actions/item-actions';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { X, CheckCircle2, Clock, AlertTriangle, Save } from 'lucide-react';
import type { ExpiryStatus } from '@/lib/types';

const STATUS_ICONS: Record<ExpiryStatus, typeof CheckCircle2> = {
  safe: CheckCircle2,
  approaching: Clock,
  critical: AlertTriangle,
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface ExpiryItemCardProps {
  item: ExpiryItemWithStatus;
  onDelete?: (id: number) => void;
  onItemUpdated?: (updated: ExpiryItemWithStatus) => void;
  onSaveItem?: (id: number, name: string, expiryDate: string) => Promise<ExpiryItemWithStatus | null>;
  demo?: boolean;
}

const ExpiryItemCardComponent = ({
  item,
  onDelete,
  onItemUpdated,
  onSaveItem,
  demo = false,
}: ExpiryItemCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const colors =
    item.status === 'safe' ? getAccentCardColors(item.name) : getStatusColors(item.status);
  const ItemIcon = getItemIcon(item.name);
  const StatusIcon = STATUS_ICONS[item.status];
  const accent = getItemAccent(item.name);
  const cardImage = getCardImage(item.name);

  const expDate = new Date(item.expiry_date);
  const year = expDate.getFullYear();
  const monthNum = expDate.getMonth() + 1;
  const month = expDate.toLocaleString('en-US', { month: 'short' });
  const day = expDate.getDate();

  const [localYear, setLocalYear] = useState(year);
  const [localMonth, setLocalMonth] = useState(monthNum);
  const [localDay, setLocalDay] = useState(day);

  useEffect(() => {
    setLocalYear(year);
    setLocalMonth(monthNum);
    setLocalDay(day);
  }, [item.expiry_date, year, monthNum, day]);

  const currentYear = new Date().getFullYear();
  const localMonthShort = new Date(2000, localMonth - 1, 1).toLocaleString('en-US', { month: 'short' });

  const hasUnsavedChanges =
    localYear !== year || localMonth !== monthNum || localDay !== day;

  const saveDate = useCallback(
    async (newYear: number, newMonth: number, newDay: number) => {
      const previousItem = item;
      const lastDay = getDaysInMonth(newYear, newMonth);
      const clampedDay = Math.min(newDay, lastDay);
      const expiryDate = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
      const formData = new FormData();
      formData.append('id', item.id.toString());
      formData.append('name', item.name);
      formData.append('expiry_date', expiryDate);

      const updatedItem = enrichItemWithStatus({ ...item, expiry_date: expiryDate });
      onItemUpdated?.(updatedItem);
      setIsUpdating(true);
      setIsEditingDate(false);
      try {
        if (onSaveItem) {
          const saved = await onSaveItem(item.id, item.name, expiryDate);
          if (saved) {
            onItemUpdated?.(enrichItemWithStatus(saved));
          } else {
            onItemUpdated?.(previousItem);
          }
        } else {
          const result = await updateItemAction(formData);
          if (result?.success && result.item) {
            onItemUpdated?.(enrichItemWithStatus(result.item));
          } else {
            onItemUpdated?.(previousItem);
          }
        }
      } catch {
        onItemUpdated?.(previousItem);
      } finally {
        setIsUpdating(false);
      }
    },
    [item, onItemUpdated, onSaveItem]
  );

  const handleUpdateDate = useCallback(() => {
    const lastDay = getDaysInMonth(localYear, localMonth);
    const clampedDay = Math.min(localDay, lastDay);
    saveDate(localYear, localMonth, clampedDay);
  }, [localYear, localMonth, localDay, saveDate]);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    await onDelete(item.id);
  };

  const card = (
    <Card
      textured
      data-testid="expiry-item-card"
      data-item-name={item.name}
      className={`
        group relative transition-all duration-300
        ${colors.bg} ${colors.glow}
        ${isDeleting ? 'opacity-50' : ''}
        overflow-hidden
      `}
    >
      {/* Category background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={cardImage}
          alt=""
          fill
          className="object-cover scale-105 opacity-55"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/60 via-white/35 to-white/10" />
      </div>
      {/* Status tint overlay */}
      <div className={`absolute inset-0 ${colors.tint} pointer-events-none`} />
      {/* White gradient behind text for readability */}
      <div className="absolute inset-y-5 inset-x-4 rounded-xl bg-linear-to-b from-white/80 via-white/60 to-white/40 shadow-sm pointer-events-none z-5" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

      <div
        className="absolute inset-0 bg-white/30 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
      />

      {!demo && (
        <Button
          variant="ghost"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="absolute top-0 right-0 h-6 w-6 p-0 z-10 text-muted-foreground hover:text-white hover:bg-destructive rounded-tr-xl min-w-0 [&_svg]:size-3"
          aria-label={`Delete ${item.name}`}
        >
          {isDeleting ? (
            <div
              className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            />
          ) : (
            <X className="size-3" />
          )}
        </Button>
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-4 px-7 py-6 pb-4 relative z-10">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`flex shrink-0 w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center shadow-sm`}
          >
            <ItemIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${colors.text} [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_4px_rgba(255,255,255,0.5)]`}>{item.name}</h3>
        </div>
        <Badge
          variant="outline"
          title={item.status}
          className={
              item.status === 'safe'
                ? 'inline-flex items-center justify-center rounded-full p-1.5 bg-emerald-100 dark:bg-emerald-500/30 border border-green-500 text-green-700 shadow-sm [text-shadow:0_1px_2px_rgba(255,255,255,0.9)]'
                : `
            inline-flex items-center justify-center rounded-full p-1.5
            ${colors.badgeBg} ${colors.text} border ${colors.border}
            shadow-sm [text-shadow:0_1px_2px_rgba(255,255,255,0.9)]
          `
          }
        >
          <StatusIcon
              className={`size-4 shrink-0 ${item.status === 'safe' ? 'text-green-600' : ''}`}
          />
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5 px-7 pt-0 pb-6 relative z-10">
        <div
          className={`space-y-3 ${colors.text} [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_4px_rgba(255,255,255,0.5)]`}
        >
          <div className="space-y-2">
            {demo ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{localYear}</span>
                <span className="text-lg font-medium opacity-75">
                  {localMonthShort} {localDay}
                </span>
              </div>
            ) : isEditingDate ? (
              <div className="space-y-3">
                <label htmlFor={`date-${item.id}`} className="sr-only">
                  Change expiry date
                </label>
                <Input
                  id={`date-${item.id}`}
                  type="date"
                  value={`${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}`}
                  min={`${currentYear}-01-01`}
                  max={`${currentYear + 50}-12-31`}
                  className="h-12 min-h-[48px] text-lg font-semibold border-border"
                  disabled={isUpdating}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const [y, m, d] = val.split('-').map(Number);
                      setLocalYear(y);
                      setLocalMonth(m);
                      setLocalDay(d);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setLocalYear(year);
                      setLocalMonth(monthNum);
                      setLocalDay(day);
                      setIsEditingDate(false);
                    }
                  }}
                />
                <p className="text-xs opacity-80">
                  Tap the date above to use your device&apos;s date picker
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingDate(true)}
                className="flex flex-col items-start gap-1 min-h-[48px] min-w-[120px] justify-center -m-1 p-1 rounded-lg cursor-pointer hover:bg-foreground/10 active:bg-foreground/15 transition-colors text-left"
                aria-label={`Edit expiry date for ${item.name}`}
              >
                <span className="text-4xl font-bold">{localYear}</span>
                <span className="text-lg font-medium opacity-75">
                  {localMonthShort} {localDay}
                </span>
                <span className="text-xs opacity-70 underline decoration-dotted">
                  Tap to change date
                </span>
              </button>
            )}
          </div>
          <p
            className={`text-sm opacity-75 font-medium ${item.status === 'critical' ? 'animate-pulse' : ''}`}
          >
            {(() => {
              const daysLeft = hasUnsavedChanges
                ? (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const localExp = new Date(localYear, localMonth - 1, localDay);
                    localExp.setHours(0, 0, 0, 0);
                    const diff = Math.ceil((localExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diff;
                  })()
                : item.daysUntilExpiry;
              if (daysLeft === 0) return '⚠️ Expires today!';
              if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
              return `${daysLeft} days left`;
            })()}
          </p>
        </div>

        {!demo && (
        <div className="flex gap-2 flex-wrap items-center">
          {isEditingDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              onClick={() => {
                setLocalYear(year);
                setLocalMonth(monthNum);
                setLocalDay(day);
                setIsEditingDate(false);
              }}
              className="min-h-[44px] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          )}
          {hasUnsavedChanges && (
            <Button
              onClick={handleUpdateDate}
              variant="default"
              size="sm"
              disabled={isUpdating}
              className="gap-2 min-h-[44px] min-w-[120px] bg-primary hover:bg-primary/90"
            >
              {isUpdating ? (
                <>
                  <div
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  Save date
                </>
              )}
            </Button>
          )}
        </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div
        className="transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-1"
      >
        {card}
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete "${item.name}"?`}
        description="This item will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        isPending={isDeleting}
      />
    </>
  );
};

export const ExpiryItemCard = memo(ExpiryItemCardComponent);
