'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { Mail, CheckCircle, Bookmark, Link2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveDiagnosisProps {
  diagnosisId: string;
  itemDescription: string;
  onSave?: () => void;
  isSaved?: boolean;
}

const EMAIL_SAVES_KEY = 'repairiq_email_saves';

function hasEmailSaved(diagnosisId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const data = JSON.parse(localStorage.getItem(EMAIL_SAVES_KEY) || '{}');
    return !!data[diagnosisId];
  } catch {
    return false;
  }
}

function markEmailSaved(diagnosisId: string, email: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(EMAIL_SAVES_KEY) || '{}');
    data[diagnosisId] = { email, savedAt: new Date().toISOString() };
    localStorage.setItem(EMAIL_SAVES_KEY, JSON.stringify(data));
  } catch {
    // silent
  }
}

export function SaveDiagnosis({ diagnosisId, itemDescription, onSave, isSaved }: SaveDiagnosisProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(() => hasEmailSaved(diagnosisId));
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/save-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          diagnosisId,
          itemDescription,
        }),
      });
    } catch {
      // graceful degradation — save locally regardless
    }

    // Always save locally + trigger parent save
    markEmailSaved(diagnosisId, email);
    onSave?.();
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/diagnose?session=${diagnosisId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  if (submitted) {
    return (
      <Card padding="md" className="bg-gradient-to-r from-brand-50 to-emerald-50 border-brand-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-surface-900">Diagnosis saved!</p>
            <p className="text-sm text-surface-500">
              We&apos;ll email you a link so you can come back anytime.
            </p>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
          >
            {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {linkCopied ? 'Copied!' : 'Copy link'}
          </button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="bg-gradient-to-r from-brand-50 to-emerald-50 border-brand-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h4 className="font-semibold text-surface-900">Save this diagnosis</h4>
          <p className="text-sm text-surface-500">
            Enter your email and we&apos;ll send you a link to revisit this diagnosis later.
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
              'w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500',
              error ? 'border-red-300' : 'border-surface-200'
            )}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={isSubmitting}
          className="flex-shrink-0"
        >
          {isSubmitting ? 'Saving...' : 'Save & Email'}
        </Button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </Card>
  );
}

export default SaveDiagnosis;
