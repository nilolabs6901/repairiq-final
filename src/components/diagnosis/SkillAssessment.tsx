'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { Difficulty } from '@/types';
import {
  X,
  Target,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Shield,
  Wrench,
  Zap,
  Clock,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SkillResult {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  recommendation: 'safe' | 'caution' | 'professional_recommended';
  tips: string[];
}

interface SkillAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  repairDifficulty: Difficulty;
  onComplete: (result: SkillResult) => void;
}

interface Question {
  id: string;
  text: string;
  icon: React.ElementType;
  options: { label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'experience',
    text: 'How much DIY repair experience do you have?',
    icon: Wrench,
    options: [
      { label: 'None - this is my first time', score: 1 },
      { label: 'A little - I\'ve done basic fixes', score: 2 },
      { label: 'Moderate - I repair things regularly', score: 3 },
      { label: 'Expert - I fix things professionally or as a hobby', score: 4 },
    ],
  },
  {
    id: 'tools',
    text: 'Do you have access to the right tools?',
    icon: Wrench,
    options: [
      { label: 'No tools at all', score: 1 },
      { label: 'Basic tools (screwdrivers, pliers)', score: 2 },
      { label: 'Good set of hand tools', score: 3 },
      { label: 'Full workshop with power tools', score: 4 },
    ],
  },
  {
    id: 'comfort',
    text: 'How comfortable are you taking things apart?',
    icon: Target,
    options: [
      { label: 'Very nervous - I might break something', score: 1 },
      { label: 'A bit unsure but willing to try', score: 2 },
      { label: 'Fairly confident with most things', score: 3 },
      { label: 'Totally comfortable - done it many times', score: 4 },
    ],
  },
  {
    id: 'electrical',
    text: 'How familiar are you with electrical safety?',
    icon: Zap,
    options: [
      { label: 'Not familiar at all', score: 1 },
      { label: 'I know to unplug things first', score: 2 },
      { label: 'I understand circuits and can use a multimeter', score: 3 },
      { label: 'Very knowledgeable about electrical systems', score: 4 },
    ],
  },
  {
    id: 'time',
    text: 'How much time can you dedicate to this repair?',
    icon: Clock,
    options: [
      { label: 'Less than 30 minutes', score: 1 },
      { label: 'Up to an hour', score: 2 },
      { label: 'A few hours', score: 3 },
      { label: 'As long as it takes', score: 4 },
    ],
  },
];

const DIFFICULTY_THRESHOLD: Record<Difficulty, number> = {
  easy: 6,
  medium: 10,
  hard: 14,
  professional: 18,
};

export function SkillAssessment({ isOpen, onClose, repairDifficulty, onComplete }: SkillAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<SkillResult | null>(null);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      const maxScore = QUESTIONS.length * 4;
      const percentage = Math.round((totalScore / maxScore) * 100);

      const level: SkillResult['level'] =
        percentage >= 70 ? 'advanced' : percentage >= 40 ? 'intermediate' : 'beginner';

      const threshold = DIFFICULTY_THRESHOLD[repairDifficulty];
      const recommendation: SkillResult['recommendation'] =
        totalScore >= threshold ? 'safe' :
        totalScore >= threshold - 4 ? 'caution' :
        'professional_recommended';

      const tips: string[] = [];
      if (newAnswers[0] <= 2) tips.push('Watch a tutorial video before starting');
      if (newAnswers[1] <= 2) tips.push('Make sure you have all necessary tools before beginning');
      if (newAnswers[2] <= 2) tips.push('Take photos at each step so you can reassemble correctly');
      if (newAnswers[3] <= 2) tips.push('Always disconnect power before working on electrical components');
      if (newAnswers[4] <= 2) tips.push('Set aside extra time - first repairs often take longer than expected');

      const skillResult: SkillResult = { score: percentage, level, recommendation, tips };
      setResult(skillResult);
      onComplete(skillResult);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

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
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md max-h-[95vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Skill Assessment</h3>
                  <p className="text-sm text-surface-500">Can you handle this repair?</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {!result ? (
              <>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-surface-500">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {Math.round(((currentQuestion) / QUESTIONS.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      animate={{ width: `${((currentQuestion) / QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const Icon = QUESTIONS[currentQuestion].icon;
                      return <Icon className="w-5 h-5 text-indigo-500" />;
                    })()}
                    <h4 className="font-medium text-surface-900">{QUESTIONS[currentQuestion].text}</h4>
                  </div>

                  <div className="space-y-2">
                    {QUESTIONS[currentQuestion].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(option.score)}
                        className="w-full text-left p-4 rounded-xl border border-surface-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm touch-manipulation"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Score Circle */}
                <div className="text-center mb-6">
                  <div className={cn(
                    'w-24 h-24 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3',
                    result.recommendation === 'safe' ? 'bg-green-100 text-green-600' :
                    result.recommendation === 'caution' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  )}>
                    {result.score}%
                  </div>
                  <Badge
                    variant={result.level === 'advanced' ? 'success' : result.level === 'intermediate' ? 'warning' : 'info'}
                    size="md"
                    icon={<Award className="w-3 h-3" />}
                  >
                    {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
                  </Badge>
                </div>

                {/* Recommendation */}
                <div className={cn(
                  'p-4 rounded-xl mb-4',
                  result.recommendation === 'safe' ? 'bg-green-50 border border-green-200' :
                  result.recommendation === 'caution' ? 'bg-amber-50 border border-amber-200' :
                  'bg-red-50 border border-red-200'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.recommendation === 'safe' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : result.recommendation === 'caution' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-red-600" />
                    )}
                    <span className={cn(
                      'font-semibold',
                      result.recommendation === 'safe' ? 'text-green-800' :
                      result.recommendation === 'caution' ? 'text-amber-800' :
                      'text-red-800'
                    )}>
                      {result.recommendation === 'safe'
                        ? 'You\'re ready for this repair!'
                        : result.recommendation === 'caution'
                        ? 'Proceed with caution'
                        : 'Consider hiring a professional'}
                    </span>
                  </div>
                  <p className={cn(
                    'text-sm',
                    result.recommendation === 'safe' ? 'text-green-700' :
                    result.recommendation === 'caution' ? 'text-amber-700' :
                    'text-red-700'
                  )}>
                    {result.recommendation === 'safe'
                      ? 'Based on your skills and experience, you should be able to handle this repair confidently.'
                      : result.recommendation === 'caution'
                      ? 'This repair is at the edge of your current skill level. Take extra precautions and consider having a backup plan.'
                      : 'This repair may be beyond your current skill level. A professional can ensure it\'s done safely and correctly.'}
                  </p>
                </div>

                {/* Personalized Tips */}
                {result.tips.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-surface-700 mb-2">Personalized Tips</h4>
                    <div className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-surface-600">
                          <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={resetAssessment}>
                    Retake
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={onClose}>
                    Got It
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SkillAssessment;
