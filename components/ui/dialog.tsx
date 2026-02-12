'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === ref.current) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'border-0 outline-none',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'bg-card text-card-foreground rounded-xl shadow-xl border border-border',
          'p-6'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 pb-4', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none', className)}
      {...props}
    />
  );
}

export { Dialog, DialogHeader, DialogTitle };
