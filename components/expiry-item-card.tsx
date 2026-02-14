'use client';

import { ExpiryItemWithStatus } from '@/lib/types';
import { getStatusColors } from '@/lib/expiry-utils';
import { getItemIcon, getItemAccent, getAccentCardColors, getCardImage } from '@/lib/item-icons';
import Image from 'next/image';
import { useState, useCallback, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const MONTHS = [
  { value: '1', label: 'Jan' },
  { value: '2', label: 'Feb' },
  { value: '3', label: 'Mar' },
  { value: '4', label: 'Apr' },
  { value: '5', label: 'May' },
  { value: '6', label: 'Jun' },
  { value: '7', label: 'Jul' },
  { value: '8', label: 'Aug' },
  { value: '9', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface ExpiryItemCardProps {
  item: ExpiryItemWithStatus;
  onDelete: (id: number) => void;
  onDateUpdated?: () => void;
  onItemUpdated?: (updated: ExpiryItemWithStatus) => void;
}

const ExpiryItemCardComponent = ({ item, onDelete, onDateUpdated, onItemUpdated }: ExpiryItemCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editingField, setEditingField] = useState<'year' | 'month' | 'day' | null>(null);
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
  const daysInMonth = getDaysInMonth(localYear, localMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  const localMonthShort = new Date(2000, localMonth - 1, 1).toLocaleString('en-US', { month: 'short' });

  const hasUnsavedChanges =
    localYear !== year || localMonth !== monthNum || localDay !== day;

  const saveDate = useCallback(
    async (newYear: number, newMonth: number, newDay: number) => {
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
      setEditingField(null);
      try {
        const result = await updateItemAction(formData);
        if (!result?.success) onDateUpdated?.();
      } catch {
        onDateUpdated?.();
      } finally {
        setIsUpdating(false);
      }
    },
    [item, onDateUpdated, onItemUpdated]
  );

  const handleUpdateDate = useCallback(() => {
    const lastDay = getDaysInMonth(localYear, localMonth);
    const clampedDay = Math.min(localDay, lastDay);
    saveDate(localYear, localMonth, clampedDay);
  }, [localYear, localMonth, localDay, saveDate]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    await onDelete(item.id);
  };

  const card = (
    <Card
      textured
      className={`
        relative transition-all duration-300
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
      <div className="absolute inset-y-5 inset-x-4 rounded-xl bg-gradient-to-b from-white/80 via-white/60 to-white/40 shadow-sm pointer-events-none z-[5]" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

      <div
        className={`absolute inset-0 bg-white/30 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />

      <Button
        variant="ghost"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isDeleting}
        className="absolute top-0 right-0 h-6 w-6 p-0 z-10 text-muted-foreground hover:text-white hover:bg-destructive rounded-tr-xl min-w-0 [&_svg]:size-3"
        aria-label="Delete item"
      >
        {isDeleting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="size-3 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <X className="size-3" />
        )}
      </Button>

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
          <div className="flex items-baseline gap-2">
            {editingField === 'year' ? (
              <Input
                type="number"
                value={localYear}
                min={currentYear}
                max={currentYear + 50}
                className="h-10 w-24 text-2xl font-bold border-border"
                autoFocus
                disabled={isUpdating}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= currentYear && val <= currentYear + 50) {
                    setLocalYear(val);
                    const maxDay = getDaysInMonth(val, localMonth);
                    if (localDay > maxDay) setLocalDay(maxDay);
                  }
                }}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingField(null);
                  if (e.key === 'Escape') {
                    setLocalYear(year);
                    setEditingField(null);
                  }
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingField('year')}
                className="text-4xl font-bold cursor-pointer hover:underline hover:bg-foreground/10 rounded px-1 -mx-1 transition-colors"
              >
                {localYear}
              </button>
            )}
            <span className="text-lg font-medium opacity-75">
              {editingField === 'month' ? (
                <Select
                  value={localMonth.toString()}
                  onValueChange={(val) => {
                    const newMonth = parseInt(val, 10);
                    setLocalMonth(newMonth);
                    const maxDay = getDaysInMonth(localYear, newMonth);
                    if (localDay > maxDay) setLocalDay(maxDay);
                  }}
                  open={editingField === 'month'}
                  onOpenChange={(open) => !open && setEditingField(null)}
                >
                  <SelectTrigger className="h-auto py-1 px-2 text-lg font-medium opacity-75 w-fit border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('month')}
                  className="cursor-pointer hover:underline hover:bg-foreground/10 rounded px-1 -mx-1 transition-colors"
                >
                  {localMonthShort}
                </button>
              )}{' '}
              {editingField === 'day' ? (
                <Select
                  value={localDay.toString()}
                  onValueChange={(val) => setLocalDay(parseInt(val, 10))}
                  open={editingField === 'day'}
                  onOpenChange={(open) => !open && setEditingField(null)}
                >
                  <SelectTrigger className="h-auto py-1 px-2 text-lg font-medium opacity-75 w-fit border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingField('day')}
                  className="cursor-pointer hover:underline hover:bg-foreground/10 rounded px-1 -mx-1 transition-colors"
                >
                  {localDay}
                </button>
              )}
            </span>
          </div>
          <motion.p
            className="text-sm opacity-75 font-medium"
            animate={{
              scale: item.status === 'critical' ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: item.status === 'critical' ? Infinity : 0,
            }}
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
          </motion.p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {hasUnsavedChanges && (
            <Button
              onClick={handleUpdateDate}
              variant="default"
              size="sm"
              disabled={isUpdating}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isUpdating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Update
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        whileHover={{ scale: 1.02, y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {card}
      </motion.div>
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
