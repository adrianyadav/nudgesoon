'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { NudgeIcon } from '@/components/nudge-icon';
import { BRAND_NAME } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/contribute', label: 'Contribute' },
];

interface NavbarProps {
  isGuest?: boolean;
  onExitGuestMode?: () => void;
}

export function Navbar({ isGuest = false, onExitGuestMode }: NavbarProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleSignInClick = () => {
    setMobileMenuOpen(false);
    router.push('/auth/signin');
  };

  const userGreeting = (
    <p className="text-sm text-muted-foreground">
      Hey,{" "}
      <span className="font-medium text-foreground">
        {session?.user?.name || session?.user?.email}
      </span>{" "}
      👋
    </p>
  );

  return (
    <nav
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <NudgeIcon className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {status === 'authenticated' && (
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md px-2 py-1 transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
          )}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md px-2 py-1 transition-colors cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          {status === 'authenticated' ? (
            <>
              <div className="text-right">{userGreeting}</div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="cursor-pointer border-border gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : status === 'loading' ? null : (
            <>
              {isGuest && (
                <p className="text-xs text-muted-foreground rounded-full bg-muted px-3 py-1">
                  Guest mode
                </p>
              )}
              {isGuest && onExitGuestMode && (
                <Button
                  variant="ghost"
                  onClick={onExitGuestMode}
                  className="cursor-pointer"
                >
                  Exit guest
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="cursor-pointer"
              >
                Sign in
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="container mx-auto px-4 py-4 max-w-7xl flex flex-col gap-2">
            {status === 'authenticated' && (
              <>
                <p className="text-sm text-muted-foreground px-2">
                  Hi,{" "}
                  <span className="font-medium text-foreground">
                    {session?.user?.name || session?.user?.email}
                  </span>{" "}
                  👋
                </p>
                <Link
                  href="/"
                  onClick={handleMobileLinkClick}
                  className="text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md px-2 py-2 transition-colors cursor-pointer"
                >
                  Dashboard
                </Link>
              </>
            )}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleMobileLinkClick}
                className="text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md px-2 py-2 transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            {status === 'authenticated' ? (
              <>
                <Button
                  onClick={() => {
                    handleSignOut();
                    handleMobileLinkClick();
                  }}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-border gap-2 w-fit"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : status === 'loading' ? null : (
              <>
                {isGuest && (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    Guest mode
                  </p>
                )}
                {isGuest && onExitGuestMode && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onExitGuestMode();
                      handleMobileLinkClick();
                    }}
                    className="cursor-pointer w-fit"
                  >
                    Exit guest
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleSignInClick}
                  className="cursor-pointer w-fit"
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
