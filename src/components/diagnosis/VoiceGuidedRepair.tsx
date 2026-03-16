'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { Card, Badge, Button } from '@/components/ui';
import { TroubleshootingStep } from '@/types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle,
  Circle,
  X,
  AlertTriangle,
  Lightbulb,
  Clock,
  Settings,
  RotateCcw,
} from 'lucide-react';

interface VoiceGuidedRepairProps {
  steps: TroubleshootingStep[];
  itemDescription: string;
  onComplete?: () => void;
  onClose?: () => void;
}

// Speech Recognition types (using any to avoid duplicate global declaration conflicts)
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string; confidence: number } } } }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

export function VoiceGuidedRepair({
  steps,
  itemDescription,
  onComplete,
  onClose,
}: VoiceGuidedRepairProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStep = steps[currentStepIndex];

  // Check if ElevenLabs is available
  useEffect(() => {
    const checkElevenLabs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/elevenlabs`, { method: 'GET' });
        const data = await response.json();
        setElevenLabsAvailable(data.available === true);
      } catch {
        setElevenLabsAvailable(false);
      }
    };
    checkElevenLabs();
  }, []);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        setVoiceSupported(true);
      }

      // Check for speech recognition support
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType; webkitSpeechRecognition?: new () => SpeechRecognitionType }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType }).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const command = event.results[last][0].transcript.toLowerCase().trim();
          handleVoiceCommand(command);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          // Restart if still supposed to be listening
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Already running
            }
          }
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    setLastCommand(command);

    if (command.includes('next') || command.includes('continue') || command.includes('done')) {
      goToNextStep();
    } else if (command.includes('back') || command.includes('previous')) {
      goToPreviousStep();
    } else if (command.includes('repeat') || command.includes('again')) {
      speakCurrentStep();
    } else if (command.includes('pause') || command.includes('stop')) {
      pauseSpeech();
    } else if (command.includes('resume') || command.includes('play')) {
      resumeSpeech();
    } else if (command.includes('tip') || command.includes('hint')) {
      speakTips();
    } else if (command.includes('warning') || command.includes('caution')) {
      speakWarnings();
    }
  }, [currentStepIndex, steps]);

  // Speak text using ElevenLabs API
  const speakWithElevenLabs = useCallback(async (text: string, onEnd?: () => void) => {
    try {
      setIsSpeaking(true);

      const response = await fetch(`${API_BASE_URL}/api/elevenlabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.playbackRate = speechRate;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Fallback to browser
        speakWithBrowser(text, onEnd);
      };

      await audio.play();
    } catch {
      setIsSpeaking(false);
      // Fallback to browser speech synthesis
      speakWithBrowser(text, onEnd);
    }
  }, [speechRate]);

  // Speak text using browser speech synthesis (fallback)
  const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || !voiceSupported) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a good English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [speechRate, voiceSupported]);

  // Main speak function - uses ElevenLabs if available, otherwise browser
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (useElevenLabs && elevenLabsAvailable) {
      speakWithElevenLabs(text, onEnd);
    } else {
      speakWithBrowser(text, onEnd);
    }
  }, [useElevenLabs, elevenLabsAvailable, speakWithElevenLabs, speakWithBrowser]);

  // Speak the current step
  const speakCurrentStep = useCallback(() => {
    if (!currentStep) return;

    const stepText = `Step ${currentStep.stepNumber}: ${currentStep.title}. ${currentStep.description}`;
    speak(stepText);
  }, [currentStep, speak]);

  // Speak tips
  const speakTips = useCallback(() => {
    if (!currentStep?.tips?.length) {
      speak("No tips for this step.");
      return;
    }

    const tipsText = `Here are some tips: ${currentStep.tips.join('. ')}`;
    speak(tipsText);
  }, [currentStep, speak]);

  // Speak warnings
  const speakWarnings = useCallback(() => {
    if (!currentStep?.warnings?.length) {
      speak("No warnings for this step.");
      return;
    }

    const warningsText = `Warning! ${currentStep.warnings.join('. ')}`;
    speak(warningsText);
  }, [currentStep, speak]);

  // Pause speech
  const pauseSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Resume speech
  const resumeSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  // Stop speech
  const stopSpeech = useCallback(() => {
    // Stop ElevenLabs audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Stop browser speech synthesis
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStepIndex);
        return next;
      });
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // All steps completed
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        next.add(currentStepIndex);
        return next;
      });
      speak("Congratulations! You've completed all the repair steps.", () => {
        onComplete?.();
      });
    }
  }, [currentStepIndex, steps.length, speak, onComplete]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Toggle voice recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already running
      }
    }
  }, [isListening]);

  // Auto-speak when step changes
  useEffect(() => {
    if (voiceSupported && currentStep) {
      speakCurrentStep();
    }
  }, [currentStepIndex]);

  // Mark step as complete
  const toggleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const progress = ((completedSteps.size / steps.length) * 100).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <h2 className="font-semibold">Voice-Guided Repair Mode</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-brand-100 text-sm">{itemDescription}</p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface-50 border-b border-surface-200 p-4 space-y-3"
            >
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-surface-700">Speech Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-surface-600 w-12">{speechRate}x</span>
              </div>
              {elevenLabsAvailable && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-surface-700">
                    Premium Voice (ElevenLabs):
                  </label>
                  <button
                    onClick={() => setUseElevenLabs(!useElevenLabs)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative',
                      useElevenLabs ? 'bg-brand-500' : 'bg-surface-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        useElevenLabs ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                  <Badge variant="success" size="sm">HD</Badge>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Step */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Step header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {currentStep.stepNumber}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-surface-900">{currentStep.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" size="sm" icon={<Clock className="w-3 h-3" />}>
                      {currentStep.estimatedTime}
                    </Badge>
                    <Badge
                      variant={
                        currentStep.difficulty === 'easy'
                          ? 'success'
                          : currentStep.difficulty === 'medium'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {currentStep.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card padding="md" className="bg-surface-50">
                <p className="text-surface-700 leading-relaxed">{currentStep.description}</p>
              </Card>

              {/* Tips */}
              {currentStep.tips && currentStep.tips.length > 0 && (
                <Card padding="md" className="bg-brand-50 border-brand-200">
                  <div className="flex items-center gap-2 text-brand-700 font-medium mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Pro Tips</span>
                    <button
                      onClick={speakTips}
                      className="ml-auto p-1 hover:bg-brand-100 rounded"
                      title="Read tips aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {currentStep.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-brand-800 flex items-start gap-2">
                        <span className="text-brand-400">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Warnings */}
              {currentStep.warnings && currentStep.warnings.length > 0 && (
                <Card padding="md" className="bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Safety Warning</span>
                    <button
                      onClick={speakWarnings}
                      className="ml-auto p-1 hover:bg-amber-100 rounded"
                      title="Read warnings aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {currentStep.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Step completion checkbox */}
              <button
                onClick={() => toggleStepComplete(currentStepIndex)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  completedSteps.has(currentStepIndex)
                    ? 'border-green-500 bg-green-50'
                    : 'border-surface-200 hover:border-brand-300'
                )}
              >
                {completedSteps.has(currentStepIndex) ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-surface-300" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    completedSteps.has(currentStepIndex) ? 'text-green-700' : 'text-surface-600'
                  )}
                >
                  {completedSteps.has(currentStepIndex) ? 'Step completed!' : 'Mark step as complete'}
                </span>
              </button>
            </motion.div>
          )}

          {/* Step overview sidebar */}
          <div className="mt-6 pt-6 border-t border-surface-200">
            <h4 className="text-sm font-medium text-surface-500 mb-3">All Steps</h4>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                    index === currentStepIndex
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-surface-50 text-surface-600'
                  )}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                        index === currentStepIndex
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-200 text-surface-500'
                      )}
                    >
                      {step.stepNumber}
                    </div>
                  )}
                  <span className="text-sm truncate">{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice control footer */}
        <div className="border-t border-surface-200 p-4 bg-surface-50">
          {/* Voice command indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mb-3 text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-surface-600">
                Listening... Say "next", "back", "repeat", or "done"
              </span>
            </div>
          )}

          {lastCommand && (
            <div className="text-center text-xs text-surface-400 mb-2">
              Last command: "{lastCommand}"
            </div>
          )}

          {/* Main controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className={cn(
                'p-3 rounded-full transition-colors',
                currentStepIndex === 0
                  ? 'text-surface-300 cursor-not-allowed'
                  : 'text-surface-600 hover:bg-surface-200'
              )}
            >
              <SkipBack className="w-6 h-6" />
            </button>

            {isSpeaking ? (
              isPaused ? (
                <button
                  onClick={resumeSpeech}
                  className="p-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  <Play className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={pauseSpeech}
                  className="p-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  <Pause className="w-8 h-8" />
                </button>
              )
            ) : (
              <button
                onClick={speakCurrentStep}
                className="p-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                title="Read step aloud"
              >
                <Play className="w-8 h-8" />
              </button>
            )}

            <button
              onClick={goToNextStep}
              className="p-3 rounded-full text-surface-600 hover:bg-surface-200 transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Secondary controls */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={speakCurrentStep}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Repeat
            </button>

            <button
              onClick={stopSpeech}
              disabled={!isSpeaking}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                isSpeaking
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-surface-300 cursor-not-allowed'
              )}
            >
              <VolumeX className="w-4 h-4" />
              Stop
            </button>

            {speechSupported && (
              <button
                onClick={toggleListening}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                  isListening
                    ? 'bg-red-100 text-red-600'
                    : 'text-surface-600 hover:bg-surface-200'
                )}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Voice
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Control
                  </>
                )}
              </button>
            )}
          </div>

          {!voiceSupported && (
            <p className="text-center text-xs text-surface-400 mt-2">
              Voice synthesis not supported in your browser
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default VoiceGuidedRepair;
