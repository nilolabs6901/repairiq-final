'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-glow active:bg-brand-700 disabled:bg-brand-300',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300 disabled:bg-surface-50 disabled:text-surface-400',
  ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 disabled:text-surface-300',
  outline: 'bg-transparent border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 disabled:border-brand-200 disabled:text-brand-300',
  danger: 'bg-accent-rose text-white hover:bg-rose-600 active:bg-rose-700 disabled:bg-rose-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 min-h-[44px]',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
