'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, Bell, Shield } from 'lucide-react';
import { NudgeIcon } from '@/components/nudge-icon';
import { BRAND_NAME } from '@/lib/constants';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
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

  const features = [
    {
      icon: Calendar,
      title: 'Simple Tracking',
      description: 'Just add the year and item name. We handle the rest.',
    },
    {
      icon: Sparkles,
      title: 'Instant Updates',
      description: 'See your items update in real-time, no waiting.',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Visual nudges when things are about to expire.',
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is yours. Each user sees only their items.',
    },
  ];

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
            <NudgeIcon className="w-16 h-16 md:w-24 md:h-24 text-primary" />
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

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => router.push('/auth/signin')}
              size="lg"
              className="cursor-pointer text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={onTryWithoutAccount}
            >
              Try Without Account
            </Button>
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

      {/* Features Section */}
      <div
        id="features"
        className="container mx-auto px-4 py-20 max-w-7xl"
      >
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Why Choose {BRAND_NAME}?
          </h2>
          <p className="text-xl text-muted-foreground">
            The simplest way to track everything that matters
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index}>
                <Card className="p-6 h-full hover:shadow-xl transition-all hover:scale-105 bg-card/80 backdrop-blur group">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy & Security Section */}
      <div
        id="privacy"
        className="container mx-auto px-4 py-20 max-w-7xl"
      >
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Privacy & Security
          </h2>
          <p className="text-xl text-muted-foreground">
            Your data stays yours. Here&apos;s how we protect it.
          </p>
        </div>

        <Card className="p-8 max-w-3xl mx-auto bg-card/80 backdrop-blur hover:shadow-xl transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Built with security first
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Encryption, isolation, and minimal data collection are baked into every layer of the stack.
              </p>
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link href="/privacy">Learn more about privacy & security</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
