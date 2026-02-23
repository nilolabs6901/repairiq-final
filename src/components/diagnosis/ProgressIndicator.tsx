'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DiagnosticStage } from '@/types';
import { MessageSquare, Search, Lightbulb, CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  stage: DiagnosticStage;
  className?: string;
}

const stages = [
  { id: 'understanding', label: 'Understanding', icon: MessageSquare },
  { id: 'narrowing', label: 'Narrowing', icon: Search },
  { id: 'solutions', label: 'Solutions', icon: Lightbulb },
  { id: 'complete', label: 'Complete', icon: CheckCircle },
];

const stageIndex: Record<DiagnosticStage, number> = {
  initial: 0,
  understanding: 0,
  narrowing: 1,
  solutions: 2,
  complete: 3,
};

export function ProgressIndicator({ stage, className }: ProgressIndicatorProps) {
  const currentIndex = stageIndex[stage];

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Compact */}
      <div className="flex md:hidden items-center justify-between px-2">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={s.id} className="flex flex-col items-center">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'bg-surface-100 text-surface-400'
                )}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isActive ? 'text-brand-600' : 'text-surface-400'
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Desktop: Full */}
      <div className="hidden md:flex items-center justify-center gap-4">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === stages.length - 1;

          return (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <motion.div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isActive
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-surface-100 text-surface-400'
                  )}
                  animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-surface-900' : 'text-surface-400'
                    )}
                  >
                    {s.label}
                  </span>
                  {isCurrent && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-brand-500"
                    >
                      In progress...
                    </motion.span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="w-12 h-0.5 mx-4 rounded-full overflow-hidden bg-surface-200">
                  <motion.div
                    className="h-full bg-brand-500"
                    initial={{ width: 0 }}
                    animate={{ width: isActive && i < currentIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 md:mt-6 h-1 bg-surface-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default ProgressIndicator;
