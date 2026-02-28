'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PRIVACY_ITEMS } from '@/lib/privacy-content';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background grain mesh-gradient dot-pattern overflow-hidden relative">
      <Navbar />

      <div className="blob blob-1 float-slow" />
      <div className="blob blob-2 float-medium" />

      <div className="container mx-auto px-4 py-20 max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            Privacy & Security
          </h1>
          <p className="text-xl text-muted-foreground">
            Your data stays yours. Here&apos;s how we protect it.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Last updated: February 2026
          </p>
        </div>

        <Card className="p-8 max-w-3xl mx-auto bg-card/80 backdrop-blur hover:shadow-xl transition-all">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Built with security first
              </h2>
              <p className="text-muted-foreground text-sm">
                Encryption, isolation, and minimal data collection are baked into every layer of the stack.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {PRIVACY_ITEMS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground/60 mt-8 max-w-3xl mx-auto">
          NudgeSoon is not directed at children under 13. For privacy questions, contact{' '}
          <a href="mailto:hello@nudgesoon.com" className="underline hover:text-foreground transition-colors">
            hello@nudgesoon.com
          </a>.
        </p>

        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="outline" className="cursor-pointer">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
