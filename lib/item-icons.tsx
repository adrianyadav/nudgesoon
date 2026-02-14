'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Laptop,
  Smartphone,
  FileCheck,
  BookOpen,
  Milk,
  Dumbbell,
  Pill,
  Car,
  Shield,
  Tv,
  CreditCard,
  Plane,
  Utensils,
  Wine,
  Droplets,
  Package,
} from 'lucide-react';

/**
 * Maps keyword (or part of item name) to a Lucide icon.
 * Order matters: first match wins. Use more specific terms first.
 */
const ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['laptop', 'computer', 'macbook', 'pc', 'notebook'], icon: Laptop },
  { keywords: ['phone', 'mobile', 'smartphone', 'sim'], icon: Smartphone },
  { keywords: ['passport', 'visa', 'id ', ' id', 'document', 'certificate'], icon: FileCheck },
  { keywords: ['book', 'license', 'permit'], icon: BookOpen },
  { keywords: ['milk', 'yogurt', 'cream', 'dairy'], icon: Milk },
  { keywords: ['gym', 'membership', 'fitness', 'pool'], icon: Dumbbell },
  { keywords: ['medicine', 'pill', 'prescription', 'drug', 'vitamin'], icon: Pill },
  { keywords: ['car', 'vehicle', 'driving', 'mot'], icon: Car },
  { keywords: ['insurance', 'warranty'], icon: Shield },
  { keywords: ['netflix', 'spotify', 'subscription', 'streaming', 'tv'], icon: Tv },
  { keywords: ['flight', 'plane', 'travel'], icon: Plane },
  { keywords: ['food', 'groceries', 'bread', 'meat'], icon: Utensils },
  { keywords: ['wine', 'beer', 'alcohol'], icon: Wine },
  { keywords: ['water', 'filter', 'bottle'], icon: Droplets },
  { keywords: ['card', 'credit', 'debit', 'bank'], icon: CreditCard },
];

const DEFAULT_ICON: LucideIcon = Package;

/**
 * Accent colors per icon type (icon background + left border for cards).
 * Order must match ICON_MAP; default used for Package/fallback.
 */
export const ITEM_ACCENT_COLORS: { iconBg: string; borderLeft: string }[] = [
  { iconBg: 'bg-blue-500', borderLeft: 'border-l-2 border-l-blue-500' },
  { iconBg: 'bg-violet-500', borderLeft: 'border-l-2 border-l-violet-500' },
  { iconBg: 'bg-sky-500', borderLeft: 'border-l-2 border-l-sky-500' },
  { iconBg: 'bg-amber-500', borderLeft: 'border-l-2 border-l-amber-500' },
  { iconBg: 'bg-emerald-500', borderLeft: 'border-l-2 border-l-emerald-500' },
  { iconBg: 'bg-orange-500', borderLeft: 'border-l-2 border-l-orange-500' },
  { iconBg: 'bg-rose-500', borderLeft: 'border-l-2 border-l-rose-500' },
  { iconBg: 'bg-slate-600', borderLeft: 'border-l-2 border-l-slate-600' },
  { iconBg: 'bg-indigo-500', borderLeft: 'border-l-2 border-l-indigo-500' },
  { iconBg: 'bg-pink-500', borderLeft: 'border-l-2 border-l-pink-500' },
  { iconBg: 'bg-cyan-500', borderLeft: 'border-l-2 border-l-cyan-500' },
  { iconBg: 'bg-amber-500', borderLeft: 'border-l-2 border-l-amber-500' },
  { iconBg: 'bg-fuchsia-500', borderLeft: 'border-l-2 border-l-fuchsia-500' },
  { iconBg: 'bg-teal-500', borderLeft: 'border-l-2 border-l-teal-500' },
  { iconBg: 'bg-emerald-500', borderLeft: 'border-l-2 border-l-emerald-500' },
  { iconBg: 'bg-slate-500', borderLeft: 'border-l-2 border-l-slate-500' },
];

const DEFAULT_ACCENT = ITEM_ACCENT_COLORS[ITEM_ACCENT_COLORS.length - 1];

/**
 * Returns the accent index (0 to length-1) for an item name.
 * -1 if no match (uses default).
 */
export function getItemAccentIndex(name: string): number {
  const lower = name.toLowerCase().trim();
  for (let i = 0; i < ICON_MAP.length; i++) {
    if (ICON_MAP[i].keywords.some((k) => lower.includes(k))) {
      return i;
    }
  }
  return ICON_MAP.length; /* default index */
}

/**
 * Returns the best-matching Lucide icon for an item name.
 * Used on cards so users can differentiate items at a glance.
 */
export function getItemIcon(name: string): LucideIcon {
  const lower = name.toLowerCase().trim();
  for (const { keywords, icon } of ICON_MAP) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return DEFAULT_ICON;
}

/**
 * Returns accent styles (icon background + left border) for an item name.
 * Same keyword matching as getItemIcon so each icon type has a stable accent.
 */
export function getItemAccent(name: string): { iconBg: string; borderLeft: string } {
  const lower = name.toLowerCase().trim();
  for (let i = 0; i < ICON_MAP.length; i++) {
    if (ICON_MAP[i].keywords.some((k) => lower.includes(k))) {
      return ITEM_ACCENT_COLORS[i];
    }
  }
  return DEFAULT_ACCENT;
}

/** Local background images per category (blurred behind cards). */
const CARD_IMAGES: string[] = [
  /* laptop/computer */ '/images/cards/laptop.jpg',
  /* phone/mobile    */ '/images/cards/phone.jpg',
  /* passport/docs   */ '/images/cards/passport.jpg',
  /* book/license    */ '/images/cards/book.jpg',
  /* milk/dairy      */ '/images/cards/milk.jpg',
  /* gym/fitness     */ '/images/cards/gym.jpg',
  /* medicine/pill   */ '/images/cards/medicine.jpg',
  /* car/vehicle     */ '/images/cards/car.jpg',
  /* insurance       */ '/images/cards/insurance.jpg',
  /* streaming/tv    */ '/images/cards/streaming.jpg',
  /* flight/travel   */ '/images/cards/flight.jpg',
  /* food/groceries  */ '/images/cards/food.jpg',
  /* wine/alcohol    */ '/images/cards/wine.jpg',
  /* water/filter    */ '/images/cards/water.jpg',
  /* card/credit     */ '/images/cards/credit-card.jpg',
];

const DEFAULT_CARD_IMAGE = '/images/cards/default.jpg';

/**
 * Returns the Unsplash background image URL for an item name.
 * Matches the same keyword logic as getItemIcon/getItemAccent.
 */
export function getCardImage(name: string): string {
  const index = getItemAccentIndex(name);
  return index < CARD_IMAGES.length ? CARD_IMAGES[index] : DEFAULT_CARD_IMAGE;
}

/** Common item names for autocomplete suggestions (order matches icon priority) */
export const ITEM_SUGGESTIONS = [
  'Passport',
  'Milk',
  'Gym membership',
  'Laptop',
  'Driving licence',
  'Netflix subscription',
  'Medicine',
  'Car insurance',
  'Warranty',
  'Phone',
  'Food',
  'Insurance',
  'Credit card',
  'Travel',
  'Water filter',
  'Wine',
] as const;
