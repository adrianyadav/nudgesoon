'use client';

import { ExpiryItemWithStatus } from '@/lib/types';
import { getStatusColors } from '@/lib/expiry-utils';
import { getItemIcon, getItemAccent, getCardImage } from '@/lib/item-icons';
import Image from 'next/image';
import { useState, useCallback } from 'react';
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
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
}

export function ExpiryItemCard({ item, onDelete, onDateUpdated }: ExpiryItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editingField, setEditingField] = useState<'year' | 'month' | 'day' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const colors = getStatusColors(item.status);
  const ItemIcon = getItemIcon(item.name);
  const StatusIcon = STATUS_ICONS[item.status];
  const accent = getItemAccent(item.name);
  const cardImage = getCardImage(item.name);

  const expDate = new Date(item.expiry_date);
  const year = expDate.getFullYear();
  const monthNum = expDate.getMonth() + 1;
  const month = expDate.toLocaleString('en-US', { month: 'short' });
  const day = expDate.getDate();

  const currentYear = new Date().getFullYear();
  const daysInMonth = getDaysInMonth(year, monthNum);
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

  const saveDate = useCallback(
    async (newYear: number, newMonth: number, newDay: number) => {
      const lastDay = getDaysInMonth(newYear, newMonth);
      const clampedDay = Math.min(newDay, lastDay);
      const expiryDate = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
      const formData = new FormData();
      formData.append('id', item.id.toString());
      formData.append('name', item.name);
      formData.append('expiry_date', expiryDate);
      setIsUpdating(true);
      await updateItemAction(formData);
      setIsUpdating(false);
      setEditingField(null);
      onDateUpdated?.();
    },
    [item.id, item.name, onDateUpdated]
  );

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
      {/* Blurred category background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={cardImage}
          alt=""
          fill
          className="object-cover blur-sm scale-105 opacity-30"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-linear-to-br from-black/20 via-black/10 to-transparent" />
      </div>
      {/* Status tint overlay */}
      <div className={`absolute inset-0 ${colors.tint} pointer-events-none`} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg pointer-events-none" />

      <motion.div
        className="absolute inset-0 bg-white/30 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 relative z-10">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: isHovered ? [0, -8, 8, 0] : 0 }}
            transition={{ duration: 0.5 }}
            className={`flex shrink-0 w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center shadow-sm`}
          >
            <ItemIcon className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className={`text-xl font-semibold ${colors.text}`}>{item.name}</h3>
        </div>
        <Badge
          variant="outline"
          title={item.status}
          className={`
            inline-flex items-center justify-center rounded-full p-1.5
            ${colors.badgeBg} ${colors.text} border ${colors.border}
            shadow-sm
          `}
        >
          <StatusIcon className="size-4 shrink-0" />
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        <motion.div
          className={`space-y-2 ${colors.text}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-baseline gap-2">
            {editingField === 'year' ? (
              <Input
                type="number"
                defaultValue={year}
                min={currentYear}
                max={currentYear + 50}
                className="h-10 w-24 text-2xl font-bold border-border"
                autoFocus
                disabled={isUpdating}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= currentYear && val <= currentYear + 50) {
                    saveDate(val, monthNum, day);
                  } else {
                    setEditingField(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val) && val >= currentYear && val <= currentYear + 50) {
                      saveDate(val, monthNum, day);
                    } else {
                      setEditingField(null);
                    }
                  }
                  if (e.key === 'Escape') setEditingField(null);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingField('year')}
                className="text-4xl font-bold cursor-pointer hover:underline hover:bg-foreground/10 rounded px-1 -mx-1 transition-colors"
              >
                {year}
              </button>
            )}
            <span className="text-lg font-medium opacity-75">
              {editingField === 'month' ? (
                <Select
                  value={monthNum.toString()}
                  onValueChange={(val) => saveDate(year, parseInt(val, 10), day)}
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
                  {month}
                </button>
              )}{' '}
              {editingField === 'day' ? (
                <Select
                  value={day.toString()}
                  onValueChange={(val) => saveDate(year, monthNum, parseInt(val, 10))}
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
                  {day}
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
            {item.daysUntilExpiry === 0
              ? '⚠️ Expires today!'
              : item.daysUntilExpiry < 0
                ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
                : `${item.daysUntilExpiry} days left`}
          </motion.p>
        </motion.div>

        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            className="gap-2 flex-1 max-w-fit right-0"
          >
            {isDeleting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
              </>
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
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
}
