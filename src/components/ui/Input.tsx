'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-white border border-surface-200 rounded-xl',
              'text-base sm:text-sm text-surface-900 placeholder:text-surface-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'transition-all duration-200',
              'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-accent-rose focus:ring-accent-rose/20 focus:border-accent-rose',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-accent-rose">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-white border border-surface-200 rounded-xl',
            'text-base sm:text-sm text-surface-900 placeholder:text-surface-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'transition-all duration-200 resize-none',
            'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
            error && 'border-accent-rose focus:ring-accent-rose/20 focus:border-accent-rose',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-accent-rose">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
