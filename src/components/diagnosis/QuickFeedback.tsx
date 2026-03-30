'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickFeedbackProps {
  diagnosisId: string;
}

type FeedbackValue = 'up' | 'down' | null;

const FEEDBACK_KEY = 'repairiq_quick_feedback';

function getSavedFeedback(diagnosisId: string): FeedbackValue {
  if (typeof window === 'undefined') return null;
  try {
    const data = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
    return data[diagnosisId]?.vote ?? null;
  } catch {
    return null;
  }
}

function saveFeedback(diagnosisId: string, vote: FeedbackValue, comment?: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
    data[diagnosisId] = { vote, comment, timestamp: new Date().toISOString() };
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));
  } catch {
    // silent fail
  }
}

export function QuickFeedback({ diagnosisId }: QuickFeedbackProps) {
  const [vote, setVote] = useState<FeedbackValue>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = getSavedFeedback(diagnosisId);
    if (saved) {
      setVote(saved);
      setSubmitted(true);
    }
  }, [diagnosisId]);

  const handleVote = (value: FeedbackValue) => {
    setVote(value);
    saveFeedback(diagnosisId, value);

    if (value === 'down') {
      setShowComment(true);
    } else {
      setSubmitted(true);
    }
  };

  const handleSubmitComment = () => {
    saveFeedback(diagnosisId, vote, comment);
    setShowComment(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-2 py-4 text-sm text-surface-500"
      >
        {vote === 'up' ? (
          <ThumbsUp className="w-4 h-4 text-brand-500" />
        ) : (
          <ThumbsDown className="w-4 h-4 text-surface-400" />
        )}
        <span>Thanks for your feedback!</span>
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">
        {!showComment ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-sm font-medium text-surface-700">Was this diagnosis helpful?</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote('up')}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all touch-manipulation min-h-[44px]',
                  vote === 'up'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-surface-600'
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                Yes, helpful
              </button>
              <button
                onClick={() => handleVote('down')}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all touch-manipulation min-h-[44px]',
                  vote === 'down'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-surface-200 hover:border-red-300 hover:bg-red-50 text-surface-600'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                Not really
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-700">What could be better?</p>
              <button
                onClick={() => { setShowComment(false); setSubmitted(true); }}
                className="p-1 rounded-lg hover:bg-surface-100 text-surface-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="The diagnosis missed... / I expected... / It would help if..."
              rows={3}
              className="w-full px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowComment(false); setSubmitted(true); }}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitComment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuickFeedback;
