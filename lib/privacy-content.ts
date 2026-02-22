import type { LucideIcon } from 'lucide-react';
import { Lock, UserCheck, Database, Eye, Trash2, Server, Puzzle } from 'lucide-react';
import { features } from '@/lib/features';

const items: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Lock,
    title: 'Encrypted at rest',
    description:
      'Your item names are encrypted with AES-256-GCM before they reach the database. Each value gets a unique initialisation vector and an authentication tag for tamper detection. Even if the database were compromised, your data would be unreadable without the encryption key.',
  },
  {
    icon: UserCheck,
    title: 'Password security',
    description:
      'Passwords are hashed with bcrypt (10 salt rounds) before storage. We never store or log plain-text passwords. Authentication is handled by NextAuth with signed JWT sessions.',
  },
  {
    icon: Database,
    title: 'Data isolation',
    description:
      'Every item is scoped to your account via a foreign key. Server actions verify your session before any read or write. You can only ever see your own data.',
  },
  {
    icon: Server,
    title: 'Secure infrastructure',
    description:
      'The database is hosted on Neon PostgreSQL with SSL-only connections. All production traffic is served over HTTPS. Session tokens are signed with a secret key.',
  },
  {
    icon: Eye,
    title: 'No tracking or selling',
    description:
      'We collect only what the app needs to function: your email, an optional display name, and the items you add. No analytics trackers, no ad networks, no data brokers. Your information is never shared with third parties.',
  },
  {
    icon: Trash2,
    title: 'You own your data',
    description:
      'Archive or permanently delete any item at any time. If you delete your account, all associated data is cascade-deleted from the database immediately.',
  },
];

if (features.chromeExtension) {
  items.push({
    icon: Puzzle,
    title: 'Extension safety',
    description:
      'The NudgeSoon Chrome Extension scans pages strictly locally within your browser to find expiry dates. It makes zero background network requests and explicitly requires your click to save an item. Imports are protected against Cross-Site Request Forgery (CSRF) via isolated payload delivery.',
  });
}

export const PRIVACY_ITEMS = items;
