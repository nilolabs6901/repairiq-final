'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button } from '@/components/ui';
import { AppRating } from '@/types';
import { saveAppRating } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import {
  Star,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Heart,
  CheckCircle,
} from 'lucide-react';

interface RateAppProps {
  diagnosisId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (rating: AppRating) => void;
}

const feedbackOptions = [
  { id: 'accurate', label: 'Accurate diagnosis', icon: CheckCircle },
  { id: 'easy_to_use', label: 'Easy to use', icon: Sparkles },
  { id: 'fast', label: 'Fast results', icon: Star },
  { id: 'saved_money', label: 'Saved me money', icon: Heart },
] as const;

export function RateApp({ diagnosisId, isOpen, onClose, onSubmit }: RateAppProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;

    const appRating: AppRating = {
      id: uuidv4(),
      diagnosisId,
      createdAt: new Date(),
      rating: rating as 1 | 2 | 3 | 4 | 5,
      wasHelpful: wasHelpful ?? true,
      wouldRecommend: wouldRecommend ?? true,
      feedback: feedback || undefined,
      feedbackCategory: selectedFeedback as AppRating['feedbackCategory'],
    };

    saveAppRating(appRating);
    onSubmit?.(appRating);
    setIsSubmitted(true);

    // Close after showing thank you
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const renderStars = () => (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'w-10 h-10 transition-colors',
              (hoveredRating || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-surface-300'
            )}
          />
        </button>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-600 fill-green-600" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Thank You!</h3>
              <p className="text-surface-600">
                Your feedback helps us improve RepairIQ for everyone.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <h2 className="font-semibold">Rate Your Experience</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-brand-100 text-sm mt-1">
                  Help us improve by sharing your feedback
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <p className="text-surface-700 mb-4">
                          How would you rate RepairIQ?
                        </p>
                        {renderStars()}
                        {rating > 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-sm text-surface-500"
                          >
                            {rating === 5 && "Excellent! We're glad you love it!"}
                            {rating === 4 && "Great! Thanks for the positive feedback!"}
                            {rating === 3 && "Thanks! We'll work to do better."}
                            {rating === 2 && "We're sorry. How can we improve?"}
                            {rating === 1 && "We're sorry to hear that."}
                          </motion.p>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        className="w-full"
                        disabled={rating === 0}
                        onClick={() => setStep(2)}
                      >
                        Continue
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Was it helpful? */}
                      <div>
                        <p className="text-surface-700 mb-3 text-center">
                          Was this diagnosis helpful?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setWasHelpful(true)}
                            className={cn(
                              'flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all',
                              wasHelpful === true
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-surface-200 hover:border-surface-300'
                            )}
                          >
                            <ThumbsUp className={cn('w-5 h-5', wasHelpful === true && 'fill-green-500')} />
                            Yes
                          </button>
                          <button
                            onClick={() => setWasHelpful(false)}
                            className={cn(
                              'flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all',
                              wasHelpful === false
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-surface-200 hover:border-surface-300'
                            )}
                          >
                            <ThumbsDown className={cn('w-5 h-5', wasHelpful === false && 'fill-red-500')} />
                            No
                          </button>
                        </div>
                      </div>

                      {/* Would recommend? */}
                      <div>
                        <p className="text-surface-700 mb-3 text-center">
                          Would you recommend RepairIQ to a friend?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setWouldRecommend(true)}
                            className={cn(
                              'flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all',
                              wouldRecommend === true
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-surface-200 hover:border-surface-300'
                            )}
                          >
                            <Heart className={cn('w-5 h-5', wouldRecommend === true && 'fill-green-500')} />
                            Yes
                          </button>
                          <button
                            onClick={() => setWouldRecommend(false)}
                            className={cn(
                              'flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all',
                              wouldRecommend === false
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-surface-200 hover:border-surface-300'
                            )}
                          >
                            <X className="w-5 h-5" />
                            No
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={() => setStep(3)}
                        >
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* What did you like? */}
                      <div>
                        <p className="text-surface-700 mb-3 text-center">
                          What did you like most? (optional)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {feedbackOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => setSelectedFeedback(
                                  selectedFeedback === option.id ? null : option.id
                                )}
                                className={cn(
                                  'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm',
                                  selectedFeedback === option.id
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-surface-200 hover:border-surface-300'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Additional feedback */}
                      <div>
                        <label className="flex items-center gap-2 text-surface-700 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          Any additional feedback? (optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Tell us what you think..."
                          className="w-full p-3 border border-surface-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setStep(2)}
                        >
                          Back
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={handleSubmit}
                        >
                          Submit Rating
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress dots */}
                {!isSubmitted && (
                  <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={cn(
                          'w-2 h-2 rounded-full transition-colors',
                          step >= s ? 'bg-brand-500' : 'bg-surface-200'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default RateApp;
