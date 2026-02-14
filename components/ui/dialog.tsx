'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const FOCUSABLE = 'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Dialog({ open, onClose, children, className, showCloseButton = true }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();
      // Focus first focusable element so keyboard users land in the modal
      const t = setTimeout(() => {
        const first = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
      }, 0);
      return () => clearTimeout(t);
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

  // Don't render the dialog element when closed - otherwise it can show in the layout
  if (!open) return null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed inset-0 z-50 w-full h-full max-w-none max-h-none p-4 overflow-hidden',
        'border-0 outline-none bg-transparent',
        'grid place-items-center',
        className
      )}
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        ref={contentRef}
        role="presentation"
        className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 z-10 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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
