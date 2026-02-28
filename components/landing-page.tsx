'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, Bell, Shield } from 'lucide-react';
import { NudgeIcon } from '@/components/nudge-icon';
import { BRAND_NAME } from '@/lib/constants';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { features as appFeatures } from '@/lib/features';
import { ExpiryItemCard } from '@/components/expiry-item-card';
import type { ExpiryItemWithStatus, ExpiryStatus } from '@/lib/types';

function createDemoItem(
  name: string,
  status: ExpiryStatus,
  daysUntilExpiry: number
): ExpiryItemWithStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + daysUntilExpiry);
  const expiryDate = expiry.toISOString().split('T')[0];
  return {
    id: 0,
    name,
    expiry_date: expiryDate,
    user_id: null,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status,
    daysUntilExpiry,
  };
}

const DEMO_ITEMS: ExpiryItemWithStatus[] = [
  createDemoItem('Passport', 'safe', 850),
  createDemoItem('Gym membership', 'approaching', 5),
  createDemoItem('Milk', 'critical', 1),
];

interface LandingPageProps {
  onTryWithoutAccount?: () => void;
}

export function LandingPage({ onTryWithoutAccount }: LandingPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background grain mesh-gradient dot-pattern overflow-hidden relative">
      <Navbar />

      {/* Decorative blobs */}
      <div className="blob blob-1 float-slow" />
      <div className="blob blob-2 float-medium" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 max-w-7xl relative z-10">
        {/* Subtle decorative circles in hero */}
        <div className="absolute top-32 left-[10%] w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-48 right-[15%] w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <Badge className="bg-primary text-primary-foreground border-0 px-4 py-2 text-sm font-medium">
              ✨ Never forget what expires
            </Badge>
          </div>

          <h1
            className="flex items-center justify-center gap-4 md:gap-6 mb-6 text-foreground tracking-tight"
          >
            <span aria-hidden="true"><NudgeIcon className="w-16 h-16 md:w-24 md:h-24 text-primary" /></span>
            <span className="text-5xl md:text-9xl font-bold">{BRAND_NAME}</span>
          </h1>

          <p
            className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
          >
            Gentle reminders for everything that expires.
            <br />
            <span className="text-xl">
              Passports, memberships, food, medicine, and more.
            </span>
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => router.push('/auth/signin')}
              size="lg"
              className="cursor-pointer text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Button>
            <button
              type="button"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-sm"
              onClick={onTryWithoutAccount}
            >
              or try it without signing up
            </button>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="max-w-5xl mx-auto relative">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />

          <Card className="p-8 bg-card/90 backdrop-blur-xl border-0 shadow-2xl relative z-10">
            <div className="grid md:grid-cols-3 gap-6">
              {DEMO_ITEMS.map((item) => (
                <div key={item.name} className="transition-transform duration-200 hover:scale-[1.02]">
                  <ExpiryItemCard item={item} demo />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {appFeatures.chromeExtension && (
        <>
          {/* Extension Section */}
          <div className="container mx-auto px-4 py-20 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
                <Image
                  src="/images/extension-demo.png"
                  alt="Chrome extension demonstration"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover md:object-contain bg-muted/50 p-4"
                />
              </div>
              <div className="order-1 md:order-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium mb-6">
                  Browser Extension
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
                  Add items directly from your browser
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Want the effortless way? Sign up to get the NudgeSoon Chrome Extension. It automatically detects expiry dates on your bills, memberships, and licenses.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                    <span className="text-muted-foreground text-lg">Browse your online accounts as usual</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                    <span className="text-muted-foreground text-lg">A gentle &quot;Save&quot; button appears next to any expiry date</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                    <span className="text-muted-foreground text-lg">Click once to securely submit it to NudgeSoon</span>
                  </li>
                </ul>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  size="lg"
                  className="cursor-pointer text-base px-8 py-5 shadow-lg hover:shadow-xl transition-all"
                >
                  Sign up to get the extension
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Features */}
      <div
        id="features"
        className="container mx-auto px-4 py-16 max-w-4xl"
      >
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground mb-1">Simple tracking</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Just add the name and year. We handle the rest.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground mb-1">Visual nudges</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Green, amber, red — know at a glance what needs attention.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground mb-1">Private by default</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Encrypted at rest. Each user sees only their own items.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy callout */}
      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        <div id="privacy" className="flex items-center justify-center gap-2 py-6 border-t border-border/50 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span>
            Encrypted at rest, no third-party tracking, minimal data collection.{' '}
            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
              Privacy & security details
            </Link>
          </span>
        </div>
      </div>

      <Footer />
    </div>
  );
}
