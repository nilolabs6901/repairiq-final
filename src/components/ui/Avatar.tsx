'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes: Record<AvatarSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden',
          'bg-gradient-to-br from-brand-400 to-brand-600',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span className="font-medium text-white">{initials}</span>
        ) : (
          <User className="text-white" size={iconSizes[size]} />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
