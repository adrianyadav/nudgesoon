'use client';
/* eslint-disable react-hooks/static-components, react-hooks/preserve-manual-memoization */

import { useState, useTransition, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { createItemAction, updateItemAction } from '@/app/actions/item-actions';
import { ExpiryItemWithStatus } from '@/lib/types';
import { enrichItemWithStatus } from '@/lib/expiry-utils';
import { getItemIcon, getCardImage, FORM_INITIAL_BACKGROUND, ITEM_SUGGESTIONS } from '@/lib/item-icons';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
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

// Pre-compute icons for all known suggestions at module load (runs once)
const SUGGESTION_ICON_CACHE = new Map<string, LucideIcon>(
  ITEM_SUGGESTIONS.map((s) => [s, getItemIcon(s)])
);

function getCachedIcon(name: string): LucideIcon {
  return SUGGESTION_ICON_CACHE.get(name) ?? getItemIcon(name);
}

// Lowercase cache for filtering
const SUGGESTIONS_LOWER = ITEM_SUGGESTIONS.map((s) => ({
  original: s,
  lower: s.toLowerCase(),
}));

// ─── Suggestion item (memoized) ───────────────────────────────────────

interface SuggestionItemProps {
  suggestion: string;
  index: number;
  isHighlighted: boolean;
  onSelect: (suggestion: string) => void;
  onHover: (index: number) => void;
}

const SuggestionItem = memo(function SuggestionItem({
  suggestion,
  index,
  isHighlighted,
  onSelect,
  onHover,
}: SuggestionItemProps) {
  const Icon = getCachedIcon(suggestion);
  return (
    <li
      id={`suggestion-${index}`}
      role="option"
      aria-selected={isHighlighted}
      className={`group cursor-pointer flex items-center gap-2 px-3 py-2 text-sm ${isHighlighted ? 'bg-accent' : 'hover:bg-accent'}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(suggestion);
      }}
      onMouseEnter={() => onHover(index)}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4 shrink-0" />
      </span>
      <span>{suggestion}</span>
    </li>
  );
});

// ─── Name autocomplete (isolated state — typing doesn't re-render parent) ──

interface NameAutocompleteProps {
  initialName: string;
  hasSelectedBg: boolean;
  onNameChange: (name: string) => void;
  onSelect: (name: string) => void;
}

function NameAutocomplete({ initialName, hasSelectedBg, onNameChange, onSelect }: NameAutocompleteProps) {
  const [name, setName] = useState(initialName);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const displaySuggestions = useMemo(() => {
    const search = name.trim().toLowerCase();
    const filtered = search
      ? SUGGESTIONS_LOWER.filter((s) => s.lower.includes(search)).map((s) => s.original)
      : ITEM_SUGGESTIONS.slice();
    return filtered.slice(0, 8);
  }, [name]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((suggestion: string) => {
    setName(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onNameChange(suggestion);
    onSelect(suggestion);
  }, [onNameChange, onSelect]);

  const handleHover = useCallback((index: number) => {
    setHighlightedIndex(index);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || displaySuggestions.length === 0) {
      if (e.key === 'Escape') setShowSuggestions(false);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displaySuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? displaySuggestions.length - 1 : prev - 1
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSelect(displaySuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const ItemIcon = getCachedIcon(name || ' ');

  return (
    <div className="space-y-2" ref={suggestionsRef}>
      <Label className="text-base" htmlFor="name">What expires? ✨</Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground">
          <ItemIcon className="h-5 w-5" />
        </div>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            setHighlightedIndex(-1);
            onNameChange(value);
          }}
          onFocus={() => {
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          required
          placeholder="Passport, milk, gym membership..."
          className={`border-border focus-visible:ring-ring text-lg pl-10 ${hasSelectedBg ? 'bg-white/95' : ''}`}
          aria-expanded={showSuggestions && displaySuggestions.length > 0}
          aria-autocomplete="list"
          aria-controls="name-suggestions"
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
        />
        {showSuggestions && displaySuggestions.length > 0 && (
          <ul
            id="name-suggestions"
            className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-lg"
            role="listbox"
          >
            {displaySuggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion}
                suggestion={suggestion}
                index={index}
                isHighlighted={index === highlightedIndex}
                onSelect={handleSelect}
                onHover={handleHover}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────

interface ExpiryItemFormProps {
  editingItem?: ExpiryItemWithStatus | null;
  onCancelEdit?: () => void;
  onItemCreateOptimistic?: (item: ExpiryItemWithStatus) => void;
  onItemCreateCommitted?: (tempId: number, item: ExpiryItemWithStatus) => void;
  onItemCreateFailed?: (tempId: number) => void;
  onCreateItem?: (name: string, expiryDate: string) => Promise<ExpiryItemWithStatus | null>;
  onUpdateItem?: (id: number, name: string, expiryDate: string) => Promise<ExpiryItemWithStatus | null>;
}

export function ExpiryItemForm({
  editingItem,
  onCancelEdit,
  onItemCreateOptimistic,
  onItemCreateCommitted,
  onItemCreateFailed,
  onCreateItem,
  onUpdateItem,
}: ExpiryItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedName, setSelectedName] = useState(editingItem?.name || '');
  const [resetKey, setResetKey] = useState(0);
  const nameRef = useRef(editingItem?.name || '');

  const editDate = editingItem ? new Date(editingItem.expiry_date) : null;
  const [year, setYear] = useState(editDate ? editDate.getFullYear().toString() : new Date().getFullYear().toString());
  const [month, setMonth] = useState(editDate ? (editDate.getMonth() + 1).toString() : '');
  const [day, setDay] = useState(editDate ? editDate.getDate().toString() : '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', nameRef.current);

    // Build date: year is required, month/day are optional
    let expiryDate: string;
    if (month && day) {
      expiryDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (month) {
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      expiryDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    } else {
      expiryDate = `${year}-12-31`;
    }

    formData.append('expiry_date', expiryDate);

    startTransition(async () => {
      if (editingItem) {
        formData.append('id', editingItem.id.toString());
        if (onUpdateItem) {
          await onUpdateItem(editingItem.id, nameRef.current, expiryDate);
        } else {
          await updateItemAction(formData);
        }
        onCancelEdit?.();
      } else {
        if (onCreateItem) {
          const created = await onCreateItem(nameRef.current, expiryDate);
          if (created) {
            nameRef.current = '';
            setSelectedName('');
            setResetKey((k) => k + 1);
            setYear(currentYear.toString());
            setMonth('');
            setDay('');
          }
          return;
        }

        const nowIso = new Date().toISOString();
        const tempId = -Date.now();
        const optimisticItem = enrichItemWithStatus({
          id: tempId,
          name: nameRef.current,
          expiry_date: expiryDate,
          user_id: null,
          archived_at: null,
          created_at: nowIso,
          updated_at: nowIso,
        });
        onItemCreateOptimistic?.(optimisticItem);

        const result = await createItemAction(formData);
        if (result?.success && result.item) {
          onItemCreateCommitted?.(tempId, enrichItemWithStatus(result.item));
          nameRef.current = '';
          setSelectedName('');
          setResetKey((k) => k + 1);
          setYear(currentYear.toString());
          setMonth('');
          setDay('');
          return;
        }

        onItemCreateFailed?.(tempId);
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

  // Only called on keystroke — stored in ref, no parent re-render
  const handleNameChange = useCallback((name: string) => {
    nameRef.current = name;
    if (!name.trim()) setSelectedName('');
  }, []);

  // Only called on suggestion select — updates bg image
  const handleNameSelect = useCallback((name: string) => {
    setSelectedName(name);
  }, []);

  const bgImage = selectedName ? getCardImage(selectedName) : FORM_INITIAL_BACKGROUND;

  return (
    <div>
      <Card className="border-border shadow-lg relative overflow-hidden wave-pattern py-6">
        {/* Category background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src={bgImage}
            alt=""
            fill
            quality={selectedName ? 75 : 90}
            className={`object-cover transition-opacity duration-300 ${selectedName ? 'blur-md' : ''}`}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/80 to-white/65" />
        </div>
        {/* Subtle shimmer strip at top */}
        <div className="absolute top-0 left-0 right-0 h-1 shimmer pointer-events-none rounded-t-lg z-10" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl bg-linear-to-r bg-primary bg-clip-text text-transparent">
            {editingItem ? 'Edit Item' : 'Add Something New'}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <NameAutocomplete
              key={resetKey}
              initialName={editingItem?.name || ''}
              hasSelectedBg={!!selectedName}
              onNameChange={handleNameChange}
              onSelect={handleNameSelect}
            />

            <div className="space-y-4">
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
                    className={`border-border focus-visible:ring-ring ${selectedName ? 'bg-white/95' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm text-gray-600">
                    Month <span className="text-gray-400">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={month || undefined} onValueChange={setMonth}>
                      <SelectTrigger className={`w-full border-border focus:ring-ring ${selectedName ? 'bg-white/95' : ''}`}>
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
                      <SelectTrigger className={`w-full border-border focus:ring-ring ${selectedName ? 'bg-white/95' : ''}`}>
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
                💡 Tip: Only year is required. Leave month/day blank if you don&apos;t know the exact date.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-linear-to-r bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
