'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Puzzle } from 'lucide-react';

export function ExtensionBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // We check this on mount to avoid Next.js hydration mismatches
    // Wrapping in setTimeout avoids strict linter warnings about sync setState in effects
    const timer = setTimeout(() => {
      const installed = localStorage.getItem('nudge_extension_installed');
      const dismissed = localStorage.getItem('nudge_extension_banner_dismissed');

      if (!installed && !dismissed) {
        setIsVisible(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    localStorage.setItem('nudge_extension_banner_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <Card className="mb-8 p-4 bg-primary/5 border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-start md:items-center gap-4 relative z-10">
        <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
          <Puzzle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Do you have the Chrome Extension?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse your online accounts, and a gentle &quot;Save&quot; button will appear magically next to any expiry dates to save them here instantly.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-center md:self-auto shrink-0 relative z-10 w-full md:w-auto mt-4 md:mt-0">
        <Button 
          size="sm" 
          className="flex-1 md:flex-none cursor-pointer"
          onClick={() => window.open('https://chrome.google.com/webstore/category/extensions', '_blank')}
        >
          Get Extension
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex-1 md:flex-none" 
          onClick={handleDismiss}
        >
          <X className="w-4 h-4 mr-1" />
          Don&apos;t show again
        </Button>
      </div>
    </Card>
  );
}
