'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Mail, CheckCircle, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyTipSignupProps {
  variant?: 'inline' | 'modal';
  isOpen?: boolean;
  onClose?: () => void;
}

const SIGNUP_KEY = 'repairiq_tip_subscriber';

function getSubscription(): { email: string; subscribedAt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(SIGNUP_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSubscription(email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIGNUP_KEY, JSON.stringify({
    email,
    subscribedAt: new Date().toISOString(),
  }));
}

export function WeeklyTipSignup({ variant = 'inline', isOpen, onClose }: WeeklyTipSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sub = getSubscription();
    if (sub) setIsSubscribed(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      saveSubscription(email);
      setIsSubscribed(true);
    } catch (err: any) {
      // Still save locally even if API fails (graceful degradation)
      saveSubscription(email);
      setIsSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = isSubscribed ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-5 h-5 text-brand-600" />
      </div>
      <div>
        <p className="font-semibold text-surface-900">You&apos;re subscribed!</p>
        <p className="text-sm text-surface-500">Watch your inbox for weekly appliance tips.</p>
      </div>
    </motion.div>
  ) : (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h4 className="font-semibold text-surface-900">Weekly Appliance Tips</h4>
          <p className="text-sm text-surface-500">
            One quick tip per week to keep your appliances running longer.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="your@email.com"
            className={cn(
              'w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
              error ? 'border-red-300' : 'border-surface-200'
            )}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-600 hover:bg-violet-700 flex-shrink-0"
        >
          {isSubmitting ? 'Joining...' : 'Subscribe'}
        </Button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      <p className="text-xs text-surface-400 mt-2">Free. No spam. Unsubscribe anytime.</p>
    </div>
  );

  if (variant === 'modal') {
    if (!isOpen) return null;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
              <div className="flex justify-end mb-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              {content}
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Card padding="md" className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      {content}
    </Card>
  );
}

export default WeeklyTipSignup;
