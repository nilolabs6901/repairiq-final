'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult, TroubleshootingStep } from '@/types';
import {
  X,
  Flag,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  ChevronRight,
  SkipForward,
  StickyNote,
  Trash2,
  Save,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface RepairCheckpointProps {
  result: DiagnosisResult;
  isOpen: boolean;
  onClose: () => void;
}

type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

interface StepProgress {
  stepId: string;
  status: StepStatus;
  notes: string;
  startedAt?: string;
  completedAt?: string;
}

interface RepairProgress {
  diagnosisId: string;
  startedAt: string;
  lastUpdated: string;
  elapsedSeconds: number;
  steps: StepProgress[];
  isActive: boolean;
}

function getStorageKey(diagnosisId: string) {
  return `repairiq-checkpoint-${diagnosisId}`;
}

function loadProgress(diagnosisId: string): RepairProgress | null {
  try {
    const data = localStorage.getItem(getStorageKey(diagnosisId));
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveProgressData(progress: RepairProgress) {
  localStorage.setItem(getStorageKey(progress.diagnosisId), JSON.stringify(progress));
}

function deleteProgressData(diagnosisId: string) {
  localStorage.removeItem(getStorageKey(diagnosisId));
}

export function RepairCheckpoint({ result, isOpen, onClose }: RepairCheckpointProps) {
  const [progress, setProgress] = useState<RepairProgress | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = loadProgress(result.id);
      if (saved) {
        setProgress(saved);
        setElapsed(saved.elapsedSeconds);
        if (saved.isActive) setIsTimerRunning(true);
      }
    }
  }, [isOpen, result.id]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  useEffect(() => {
    if (progress && isTimerRunning && elapsed % 10 === 0) {
      const updated = { ...progress, elapsedSeconds: elapsed, lastUpdated: new Date().toISOString() };
      saveProgressData(updated);
    }
  }, [elapsed]);

  const startRepair = () => {
    const newProgress: RepairProgress = {
      diagnosisId: result.id,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      elapsedSeconds: 0,
      steps: result.troubleshootingSteps.map(s => ({
        stepId: s.id,
        status: 'not_started',
        notes: '',
      })),
      isActive: true,
    };
    setProgress(newProgress);
    setElapsed(0);
    setIsTimerRunning(true);
    saveProgressData(newProgress);
  };

  const toggleTimer = () => {
    if (progress) {
      const updated = { ...progress, isActive: !isTimerRunning, elapsedSeconds: elapsed, lastUpdated: new Date().toISOString() };
      setProgress(updated);
      saveProgressData(updated);
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const updateStepStatus = (stepId: string, status: StepStatus) => {
    if (!progress) return;
    const updated = {
      ...progress,
      lastUpdated: new Date().toISOString(),
      elapsedSeconds: elapsed,
      steps: progress.steps.map(s =>
        s.stepId === stepId
          ? {
              ...s,
              status,
              ...(status === 'in_progress' ? { startedAt: new Date().toISOString() } : {}),
              ...(status === 'completed' || status === 'skipped' ? { completedAt: new Date().toISOString() } : {}),
            }
          : s
      ),
    };
    setProgress(updated);
    saveProgressData(updated);
  };

  const saveNote = (stepId: string) => {
    if (!progress) return;
    const updated = {
      ...progress,
      lastUpdated: new Date().toISOString(),
      steps: progress.steps.map(s =>
        s.stepId === stepId ? { ...s, notes: noteText } : s
      ),
    };
    setProgress(updated);
    saveProgressData(updated);
    setEditingNote(null);
    setNoteText('');
  };

  const handleDelete = () => {
    deleteProgressData(result.id);
    setProgress(null);
    setElapsed(0);
    setIsTimerRunning(false);
    setShowDeleteConfirm(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completedSteps = progress?.steps.filter(s => s.status === 'completed').length || 0;
  const totalSteps = result.troubleshootingSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'skipped': return 'bg-surface-300 text-white';
      default: return 'bg-surface-200 text-surface-500';
    }
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'skipped': return <SkipForward className="w-4 h-4" />;
      default: return <span className="text-xs font-bold">?</span>;
    }
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
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <Card padding="lg" className="rounded-t-3xl sm:rounded-3xl rounded-b-none sm:rounded-b-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">Repair Progress</h3>
                  <p className="text-sm text-surface-500">Track and save your progress</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-100 touch-manipulation">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {!progress ? (
              <div className="text-center py-8">
                <Flag className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-surface-900 mb-2">Ready to start?</h4>
                <p className="text-surface-500 mb-6">
                  Track your repair progress step by step. Your progress will be saved automatically.
                </p>
                <Button variant="primary" icon={<Play className="w-4 h-4" />} onClick={startRepair}>
                  Start Repair Session
                </Button>
              </div>
            ) : (
              <>
                {/* Timer & Progress */}
                <div className="flex items-center justify-between mb-4 p-4 bg-surface-50 rounded-xl">
                  <div>
                    <p className="text-xs text-surface-500">Elapsed Time</p>
                    <p className="text-2xl font-mono font-bold text-surface-900">{formatTime(elapsed)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">Progress</p>
                    <p className="text-2xl font-bold text-cyan-600">{progressPercent}%</p>
                  </div>
                  <button
                    onClick={toggleTimer}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                      isTimerRunning
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    )}
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>

                <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="h-full bg-cyan-500 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-6">
                  {result.troubleshootingSteps.map((step, i) => {
                    const stepProgress = progress.steps[i];
                    if (!stepProgress) return null;
                    return (
                      <div key={step.id} className={cn(
                        'p-3 rounded-xl border transition-colors',
                        stepProgress.status === 'in_progress' ? 'border-blue-200 bg-blue-50' :
                        stepProgress.status === 'completed' ? 'border-green-200 bg-green-50' :
                        'border-surface-200'
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getStatusColor(stepProgress.status))}>
                            {getStatusIcon(stepProgress.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium text-sm',
                              stepProgress.status === 'completed' ? 'text-green-800' :
                              stepProgress.status === 'skipped' ? 'text-surface-400 line-through' :
                              'text-surface-900'
                            )}>
                              Step {step.stepNumber}: {step.title}
                            </p>
                            <p className="text-xs text-surface-500">{step.estimatedTime}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            {stepProgress.status === 'not_started' && (
                              <button
                                onClick={() => updateStepStatus(step.id, 'in_progress')}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-surface-100 text-blue-600"
                                title="Start step"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {stepProgress.status === 'in_progress' && (
                              <button
                                onClick={() => updateStepStatus(step.id, 'completed')}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-green-100 text-green-600"
                                title="Mark complete"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(stepProgress.status === 'not_started' || stepProgress.status === 'in_progress') && (
                              <button
                                onClick={() => updateStepStatus(step.id, 'skipped')}
                                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-surface-100 text-surface-400"
                                title="Skip step"
                              >
                                <SkipForward className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingNote(step.id);
                                setNoteText(stepProgress.notes);
                              }}
                              className={cn(
                                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-surface-100',
                                stepProgress.notes ? 'text-amber-600' : 'text-surface-400'
                              )}
                              title="Add note"
                            >
                              <StickyNote className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {stepProgress.notes && editingNote !== step.id && (
                          <div className="mt-2 ml-11 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
                            {stepProgress.notes}
                          </div>
                        )}

                        {editingNote === step.id && (
                          <div className="mt-2 ml-11">
                            <textarea
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder="Add a note for this step..."
                              className="w-full p-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-1">
                              <Button size="sm" variant="primary" onClick={() => saveNote(step.id)}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditingNote(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600"
                  >
                    Reset
                  </Button>
                  <div className="flex-1" />
                  <Button variant="primary" onClick={onClose}>
                    Close
                  </Button>
                </div>

                {showDeleteConfirm && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800 mb-3">Are you sure? This will delete all your progress for this repair.</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                      <Button size="sm" variant="primary" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        Delete Progress
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RepairCheckpoint;
