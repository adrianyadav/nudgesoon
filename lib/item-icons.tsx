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
 * Full card color set per accent (for safe-status cards).
 * Order matches ITEM_ACCENT_COLORS.
 */
const ACCENT_CARD_COLORS: {
  bg: string;
  tint: string;
  text: string;
  border: string;
  glow: string;
  iconBg: string;
  badgeBg: string;
}[] = [
  { bg: 'bg-linear-to-br from-blue-50 to-blue-100', tint: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.25)]', iconBg: 'bg-linear-to-br from-blue-500 to-blue-600', badgeBg: 'bg-blue-500/20' },
  { bg: 'bg-linear-to-br from-violet-50 to-violet-100', tint: 'bg-violet-500/10', text: 'text-violet-700', border: 'border-violet-500', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.25)]', iconBg: 'bg-linear-to-br from-violet-500 to-violet-600', badgeBg: 'bg-violet-500/20' },
  { bg: 'bg-linear-to-br from-sky-50 to-sky-100', tint: 'bg-sky-500/10', text: 'text-sky-700', border: 'border-sky-500', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.25)]', iconBg: 'bg-linear-to-br from-sky-500 to-sky-600', badgeBg: 'bg-sky-500/20' },
  { bg: 'bg-linear-to-br from-amber-50 to-amber-100', tint: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]', iconBg: 'bg-linear-to-br from-amber-500 to-amber-600', badgeBg: 'bg-amber-500/20' },
  { bg: 'bg-linear-to-br from-emerald-50 to-emerald-100', tint: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]', iconBg: 'bg-linear-to-br from-emerald-500 to-emerald-600', badgeBg: 'bg-emerald-500/20' },
  { bg: 'bg-linear-to-br from-orange-50 to-orange-100', tint: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]', iconBg: 'bg-linear-to-br from-orange-500 to-orange-600', badgeBg: 'bg-orange-500/20' },
  { bg: 'bg-linear-to-br from-rose-50 to-rose-100', tint: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]', iconBg: 'bg-linear-to-br from-rose-500 to-rose-600', badgeBg: 'bg-rose-500/20' },
  { bg: 'bg-linear-to-br from-slate-50 to-slate-100', tint: 'bg-slate-600/10', text: 'text-slate-700', border: 'border-slate-600', glow: 'shadow-[0_0_20px_rgba(71,85,105,0.25)]', iconBg: 'bg-linear-to-br from-slate-600 to-slate-700', badgeBg: 'bg-slate-600/20' },
  { bg: 'bg-linear-to-br from-indigo-50 to-indigo-100', tint: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]', iconBg: 'bg-linear-to-br from-indigo-500 to-indigo-600', badgeBg: 'bg-indigo-500/20' },
  { bg: 'bg-linear-to-br from-pink-50 to-pink-100', tint: 'bg-pink-500/10', text: 'text-pink-700', border: 'border-pink-500', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.25)]', iconBg: 'bg-linear-to-br from-pink-500 to-pink-600', badgeBg: 'bg-pink-500/20' },
  { bg: 'bg-linear-to-br from-cyan-50 to-cyan-100', tint: 'bg-cyan-500/10', text: 'text-cyan-700', border: 'border-cyan-500', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]', iconBg: 'bg-linear-to-br from-cyan-500 to-cyan-600', badgeBg: 'bg-cyan-500/20' },
  { bg: 'bg-linear-to-br from-amber-50 to-amber-100', tint: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]', iconBg: 'bg-linear-to-br from-amber-500 to-amber-600', badgeBg: 'bg-amber-500/20' },
  { bg: 'bg-linear-to-br from-fuchsia-50 to-fuchsia-100', tint: 'bg-fuchsia-500/10', text: 'text-fuchsia-700', border: 'border-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(217,70,239,0.25)]', iconBg: 'bg-linear-to-br from-fuchsia-500 to-fuchsia-600', badgeBg: 'bg-fuchsia-500/20' },
  { bg: 'bg-linear-to-br from-teal-50 to-teal-100', tint: 'bg-teal-500/10', text: 'text-teal-700', border: 'border-teal-500', glow: 'shadow-[0_0_20px_rgba(20,184,166,0.25)]', iconBg: 'bg-linear-to-br from-teal-500 to-teal-600', badgeBg: 'bg-teal-500/20' },
  { bg: 'bg-linear-to-br from-emerald-50 to-emerald-100', tint: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]', iconBg: 'bg-linear-to-br from-emerald-500 to-emerald-600', badgeBg: 'bg-emerald-500/20' },
  { bg: 'bg-linear-to-br from-slate-50 to-slate-100', tint: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500', glow: 'shadow-[0_0_20px_rgba(100,116,139,0.25)]', iconBg: 'bg-linear-to-br from-slate-500 to-slate-600', badgeBg: 'bg-slate-500/20' },
  { bg: 'bg-linear-to-br from-slate-50 to-slate-100', tint: 'bg-slate-500/10', text: 'text-slate-700', border: 'border-slate-500', glow: 'shadow-[0_0_20px_rgba(100,116,139,0.25)]', iconBg: 'bg-linear-to-br from-slate-500 to-slate-600', badgeBg: 'bg-slate-500/20' },
];

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

/**
 * Returns full card color set based on item accent (for safe-status cards).
 * Use instead of getStatusColors when status is 'safe'.
 */
export function getAccentCardColors(name: string): {
  bg: string;
  tint: string;
  text: string;
  border: string;
  glow: string;
  iconBg: string;
  badgeBg: string;
} {
  const index = getItemAccentIndex(name);
  return ACCENT_CARD_COLORS[Math.min(index, ACCENT_CARD_COLORS.length - 1)];
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
