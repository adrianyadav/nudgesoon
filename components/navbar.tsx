'use client';

import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { NudgeIcon } from '@/components/nudge-icon';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <NudgeIcon className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Nudge</span>
        </Link>

        {status === 'authenticated' ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-muted-foreground">Welcome back, <span className="font-medium text-foreground">
                {session?.user?.name || session?.user?.email}
              </span></p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="cursor-pointer border-border gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        ) : status === 'loading' ? null : (
          <Button
            variant="outline"
            onClick={() => router.push('/auth/signin')}
            className="cursor-pointer"
          >
            Sign in
          </Button>
        )}
      </div>
    </motion.nav>
  );
}
