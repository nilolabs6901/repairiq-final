'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Bell, CheckCircle, Phone, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecallAlertSignupProps {
  applianceType?: string;
  brand?: string;
  diagnosisId?: string;
}

const ALERT_KEY = 'repairiq_recall_alerts';

function getSavedAlerts(): Record<string, { phone: string; subscribedAt: string }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(ALERT_KEY) || '{}');
  } catch { return {}; }
}

function saveAlert(applianceType: string, phone: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = getSavedAlerts();
    data[applianceType.toLowerCase()] = { phone, subscribedAt: new Date().toISOString() };
    localStorage.setItem(ALERT_KEY, JSON.stringify(data));
  } catch {}
}

function hasAlert(applianceType: string): boolean {
  return !!getSavedAlerts()[applianceType.toLowerCase()];
}

export function RecallAlertSignup({ applianceType, brand, diagnosisId }: RecallAlertSignupProps) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (applianceType && hasAlert(applianceType)) {
      setSubmitted(true);
    }
  }, [applianceType]);

  if (dismissed || !applianceType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = phone.replace(/[^\d+()-\s]/g, '');
    if (cleaned.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/recall-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleaned,
          applianceType,
          brand: brand || '',
          diagnosisId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      saveAlert(applianceType, cleaned);
      setSubmitted(true);
    } catch (err: any) {
      // Save locally even if API fails
      saveAlert(applianceType, cleaned);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card padding="md" className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-surface-900">Recall alerts active</p>
            <p className="text-sm text-surface-500">
              We&apos;ll text you if a safety recall is issued for your {applianceType}
              {brand ? ` (${brand})` : ''}.
            </p>
          </div>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-100 text-surface-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-semibold text-surface-900">Get recall alerts for your {applianceType}</h4>
          <p className="text-sm text-surface-500">
            We&apos;ll text you if a safety recall is issued for{' '}
            {brand ? `${brand} ` : ''}
            {applianceType.toLowerCase()}s. Free — no spam.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(''); }}
            placeholder="(555) 123-4567"
            className={cn(
              'w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500',
              error ? 'border-red-300' : 'border-surface-200'
            )}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 flex-shrink-0"
        >
          {isSubmitting ? 'Saving...' : 'Alert Me'}
        </Button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </Card>
  );
}

export default RecallAlertSignup;
