'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Badge } from '@/components/ui';
import { RepairOutcome } from '@/types';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface OutcomeFeedbackProps {
  diagnosisId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (outcome: RepairOutcome) => void;
}

export function OutcomeFeedback({ diagnosisId, isOpen, onClose, onSubmit }: OutcomeFeedbackProps) {
  const [wasSuccessful, setWasSuccessful] = useState<boolean | null>(null);
  const [actualIssue, setActualIssue] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [actualTime, setActualTime] = useState('');
  const [difficultyRating, setDifficultyRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (wasSuccessful === null) return;

    const outcome: RepairOutcome = {
      diagnosisId,
      reportedAt: new Date(),
      wasSuccessful,
      actualIssue: actualIssue || undefined,
      actualCost: actualCost || undefined,
      actualTime: actualTime || undefined,
      difficultyRating,
      notes: notes || undefined,
      wouldRecommend,
    };

    onSubmit(outcome);
    onClose();
  };

  const resetForm = () => {
    setWasSuccessful(null);
    setActualIssue('');
    setActualCost('');
    setActualTime('');
    setDifficultyRating(3);
    setNotes('');
    setWouldRecommend(true);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg"
        >
          <Card padding="lg" className="relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-surface-900">
                Report Your Outcome
              </h2>
              <p className="text-surface-600 text-sm mt-1">
                Help us improve diagnoses for others
              </p>
            </div>

            {/* Step 1: Success/Failure */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <p className="font-medium text-surface-800">Did the repair work?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setWasSuccessful(true);
                      setStep(2);
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                      wasSuccessful === true
                        ? 'border-green-500 bg-green-50'
                        : 'border-surface-200 hover:border-green-300 hover:bg-green-50/50'
                    )}
                  >
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                    <span className="font-medium text-surface-900">Yes, it worked!</span>
                  </button>
                  <button
                    onClick={() => {
                      setWasSuccessful(false);
                      setStep(2);
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                      wasSuccessful === false
                        ? 'border-red-500 bg-red-50'
                        : 'border-surface-200 hover:border-red-300 hover:bg-red-50/50'
                    )}
                  >
                    <ThumbsDown className="w-8 h-8 text-red-600" />
                    <span className="font-medium text-surface-900">No, it didn't</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* If failed, ask what the actual issue was */}
                {wasSuccessful === false && (
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      What was the actual issue? (optional)
                    </label>
                    <input
                      type="text"
                      value={actualIssue}
                      onChange={(e) => setActualIssue(e.target.value)}
                      placeholder="e.g., It was actually a faulty capacitor"
                      className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}

                {/* Time spent */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Actual time spent
                  </label>
                  <input
                    type="text"
                    value={actualTime}
                    onChange={(e) => setActualTime(e.target.value)}
                    placeholder="e.g., 45 minutes"
                    className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Actual cost
                  </label>
                  <input
                    type="text"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="e.g., $25"
                    className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Difficulty rating */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    How difficult was it?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setDifficultyRating(rating as 1 | 2 | 3 | 4 | 5)}
                        className={cn(
                          'flex-1 py-2 rounded-lg border-2 transition-all',
                          difficultyRating === rating
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-surface-200 hover:border-brand-300'
                        )}
                      >
                        <Star
                          className={cn(
                            'w-5 h-5 mx-auto',
                            difficultyRating >= rating ? 'fill-brand-500 text-brand-500' : 'text-surface-300'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-surface-500 mt-1">
                    <span>Very Easy</span>
                    <span>Very Hard</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Final feedback */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {/* Would recommend */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Would you recommend RepairIQ?
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWouldRecommend(true)}
                      className={cn(
                        'flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all',
                        wouldRecommend
                          ? 'border-green-500 bg-green-50'
                          : 'border-surface-200 hover:border-green-300'
                      )}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Yes</span>
                    </button>
                    <button
                      onClick={() => setWouldRecommend(false)}
                      className={cn(
                        'flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all',
                        !wouldRecommend
                          ? 'border-red-500 bg-red-50'
                          : 'border-surface-200 hover:border-red-300'
                      )}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">No</span>
                    </button>
                  </div>
                </div>

                {/* Additional notes */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any tips for others or feedback for us?"
                    rows={3}
                    className="w-full px-4 py-2 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} className="flex-1">
                    Submit Feedback
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    s <= step ? 'bg-brand-500' : 'bg-surface-200'
                  )}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default OutcomeFeedback;
