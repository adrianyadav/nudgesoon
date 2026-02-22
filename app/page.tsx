'use client';

import { useCallback, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { LandingPage } from '@/components/landing-page';
import { Dashboard } from '@/components/dashboard';
import { getGuestMode, setGuestMode } from '@/lib/guest-storage';

export default function HomePage() {
  const { status } = useSession();
  const [guestMode, setGuestModeState] = useState<boolean>(() => getGuestMode());

  const handleTryWithoutAccount = useCallback(() => {
    setGuestMode(true);
    setGuestModeState(true);
  }, []);

  const handleExitGuestMode = useCallback(() => {
    setGuestMode(false);
    setGuestModeState(false);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin"
        />
      </div>
    );
  }

  if (status === 'authenticated' || guestMode) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <Dashboard isGuest={status !== 'authenticated'} onExitGuestMode={handleExitGuestMode} />
      </Suspense>
    );
  }

  return <LandingPage onTryWithoutAccount={handleTryWithoutAccount} />;
}
