import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BRAND_NAME } from '@/lib/constants';

interface NudgeIconProps {
  className?: string;
  size?: number;
}

export function NudgeIcon({ className, size = 64 }: NudgeIconProps) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full', className)} style={{ width: size, height: size }}>
      <Image
        src="/nudgesoon-icon.png"
        alt={`${BRAND_NAME} Logo`}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}
