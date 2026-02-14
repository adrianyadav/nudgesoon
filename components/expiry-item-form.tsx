'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createItemAction, updateItemAction } from '@/app/actions/item-actions';
import { ExpiryItemWithStatus } from '@/lib/types';
import { getItemIcon, ITEM_SUGGESTIONS } from '@/lib/item-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpiryItemFormProps {
  editingItem?: ExpiryItemWithStatus | null;
  onCancelEdit?: () => void;
  onItemCreated?: () => void;
}

export function ExpiryItemForm({ editingItem, onCancelEdit, onItemCreated }: ExpiryItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(editingItem?.name || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const editDate = editingItem ? new Date(editingItem.expiry_date) : null;
  const [year, setYear] = useState(editDate ? editDate.getFullYear().toString() : new Date().getFullYear().toString());
  const [month, setMonth] = useState(editDate ? (editDate.getMonth() + 1).toString() : '');
  const [day, setDay] = useState(editDate ? editDate.getDate().toString() : '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);

    // Build date: year is required, month/day are optional
    let expiryDate: string;
    if (month && day) {
      // Full date provided
      expiryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (month) {
      // Year and month provided, default to last day of month
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      expiryDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    } else {
      // Only year provided, default to Dec 31
      expiryDate = `${year}-12-31`;
    }

    formData.append('expiry_date', expiryDate);

    startTransition(async () => {
      if (editingItem) {
        formData.append('id', editingItem.id.toString());
        await updateItemAction(formData);
        onCancelEdit?.();
      } else {
        await createItemAction(formData);
        setName('');
        setYear(currentYear.toString());
        setMonth('');
        setDay('');
        onItemCreated?.();
      }
    });
  };

  const currentYear = new Date().getFullYear();
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const getDaysInMonth = () => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => (i + 1).toString());

  const search = name.trim().toLowerCase();
  const filteredSuggestions = search
    ? ITEM_SUGGESTIONS.filter((s) => s.toLowerCase().includes(search))
    : [...ITEM_SUGGESTIONS];
  const displaySuggestions = filteredSuggestions.slice(0, 8);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ItemIcon = getItemIcon(name || ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border shadow-lg relative overflow-hidden wave-pattern py-6">
        {/* Subtle shimmer strip at top */}
        <div className="absolute top-0 left-0 right-0 h-1 shimmer pointer-events-none rounded-t-lg" />
        <CardHeader>
          <CardTitle className="text-2xl bg-linear-to-r bg-primary bg-clip-text text-transparent">
            {editingItem ? 'Edit Item' : 'Add Something New'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-2"
              ref={suggestionsRef}
            >
              <Label htmlFor="name">What expires? ✨</Label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground">
                  <ItemIcon className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  autoComplete="off"
                  required
                  placeholder="Passport, milk, gym membership..."
                  className="border-border focus-visible:ring-ring text-lg pl-10"
                />
                {showSuggestions && displaySuggestions.length > 0 && (
                  <ul
                    className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg"
                    role="listbox"
                  >
                    {displaySuggestions.map((suggestion) => {
                      const SuggestionIcon = getItemIcon(suggestion);
                      return (
                        <li
                          key={suggestion}
                          role="option"
                          className="group cursor-pointer flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setName(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <SuggestionIcon className="h-4 w-4 shrink-0" />
                          </span>
                          <span>{suggestion}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4"
            >
              <Label className="text-base">When does it expire?</Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm text-gray-600">
                    Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    min={currentYear}
                    max={currentYear + 50}
                    placeholder={currentYear.toString()}
                    className="border-border focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm text-gray-600">
                    Month <span className="text-gray-400">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={month || undefined} onValueChange={setMonth}>
                      <SelectTrigger className="w-full border-border focus:ring-ring">
                        <SelectValue placeholder="Any month" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-60">
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {month && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMonth('');
                          setDay('');
                        }}
                        className="shrink-0 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day" className="text-sm text-gray-600">
                    Day <span className="text-gray-400">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={day || undefined} onValueChange={setDay} disabled={!month}>
                      <SelectTrigger className="w-full border-border focus:ring-ring">
                        <SelectValue placeholder="Any day" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-60">
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {day && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDay('')}
                        className="shrink-0 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                💡 Tip: Only year is required. Leave month/day blank if you don't know the exact date.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex gap-2"
            >
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Saving...
                  </span>
                ) : editingItem ? (
                  'Update'
                ) : (
                  'Add'
                )}
              </Button>

              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="border-border"
                >
                  Cancel
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
