'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white border border-surface-100 shadow-card',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-transparent border-2 border-surface-200',
  glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-card',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, onClick, ...props }, ref) => {
    const baseClassName = cn(
      'rounded-3xl transition-all duration-300',
      variantStyles[variant],
      paddingStyles[padding],
      hover && 'cursor-pointer',
      className
    );

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          whileHover={{ y: -2, boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.12)' }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClassName} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-surface-900 font-display', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-surface-500 mt-1', className)} {...props} />
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 flex items-center gap-3', className)} {...props} />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
