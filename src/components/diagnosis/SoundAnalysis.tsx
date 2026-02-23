'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { SoundRecording } from '@/types';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  X,
  Volume2,
  Waves,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface SoundAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: string, soundType: string) => void;
  sessionId?: string;
}

const SOUND_TYPES = [
  { id: 'grinding', label: 'Grinding', icon: '⚙️', description: 'Metal on metal, rough scraping' },
  { id: 'clicking', label: 'Clicking', icon: '🔘', description: 'Repetitive clicking or ticking' },
  { id: 'humming', label: 'Humming', icon: '🔊', description: 'Constant low vibration' },
  { id: 'squeaking', label: 'Squeaking', icon: '🐭', description: 'High-pitched squealing' },
  { id: 'rattling', label: 'Rattling', icon: '🔔', description: 'Loose parts shaking' },
  { id: 'buzzing', label: 'Buzzing', icon: '🐝', description: 'Electrical humming or buzzing' },
  { id: 'other', label: 'Other', icon: '❓', description: 'Something else' },
] as const;

export function SoundAnalysis({ isOpen, onClose, onAnalysisComplete, sessionId }: SoundAnalysisProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedSoundType, setSelectedSoundType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'record' | 'describe' | 'analyze' | 'result'>('record');
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analyzer for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level visualization
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStep('describe');
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setStep('record');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeSound = async () => {
    if (!selectedSoundType) {
      setError('Please select a sound type');
      return;
    }

    setIsAnalyzing(true);
    setStep('analyze');
    setError(null);

    try {
      // Simulate AI analysis (in production, this would send audio to backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const soundLabel = SOUND_TYPES.find(s => s.id === selectedSoundType)?.label || 'Unknown';

      // Generate analysis based on sound type
      const analyses: Record<string, string> = {
        grinding: `Based on the grinding sound you recorded (${formatTime(recordingTime)}), this typically indicates worn bearings, a failing motor, or debris caught in moving parts. ${description ? `Your description "${description}" helps narrow this down. ` : ''}Common causes include: worn drum bearings in washers/dryers, failing compressor in refrigerators, or worn pump in dishwashers. Recommend inspecting the motor assembly and checking for any loose debris.`,
        clicking: `The clicking sound (${formatTime(recordingTime)}) suggests a relay attempting to engage, a stuck valve, or an electrical component cycling. ${description ? `Based on your description "${description}": ` : ''}This could indicate a faulty start relay in a refrigerator, a defective igniter in a gas appliance, or a timer motor issue. Check if the clicking is rhythmic (relay) or irregular (mechanical obstruction).`,
        humming: `A constant humming sound (${formatTime(recordingTime)}) typically indicates a motor running but not engaging, or a compressor issue. ${description ? `Your note "${description}" provides context. ` : ''}This often points to a failing capacitor, a seized compressor, or a motor that can't overcome mechanical resistance. Try checking if the appliance is level and that nothing is blocking airflow.`,
        squeaking: `The squeaking sound (${formatTime(recordingTime)}) usually indicates worn belts, dry bearings, or metal-on-metal contact. ${description ? `Your description "${description}" helps identify the source. ` : ''}Common causes: worn dryer belt, washing machine drum bearing needs lubrication, or fan blade rubbing against housing. Lubrication may resolve the issue temporarily.`,
        rattling: `A rattling sound (${formatTime(recordingTime)}) suggests loose components, debris in the system, or worn mounting hardware. ${description ? `Based on "${description}": ` : ''}Check for loose screws, worn shock absorbers (in washers), or items caught in the drum. The appliance may need to be leveled or internal components tightened.`,
        buzzing: `The buzzing sound (${formatTime(recordingTime)}) indicates an electrical issue such as a failing relay, transformer, or loose electrical connection. ${description ? `Your note "${description}" is helpful. ` : ''}This could be a faulty solenoid, capacitor issue, or electrical arcing. SAFETY: If the buzzing is accompanied by burning smell, unplug immediately and consult a professional.`,
        other: `Based on the recorded sound (${formatTime(recordingTime)}) ${description ? `and your description "${description}"` : ''}, this appears to be an unusual noise that may require professional diagnosis. Consider recording the sound when it's most prominent and noting exactly when it occurs (startup, during operation, shutdown) for more accurate diagnosis.`,
      };

      const result = analyses[selectedSoundType] || analyses.other;
      setAnalysisResult(result);
      setStep('result');

    } catch (err) {
      setError('Failed to analyze sound. Please try again.');
      setStep('describe');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    if (analysisResult && selectedSoundType) {
      onAnalysisComplete(analysisResult, selectedSoundType);
      onClose();
    }
  };

  const handleClose = () => {
    if (isRecording) stopRecording();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <Card padding="lg" className="relative">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-100 transition-colors"
            >
              <X className="w-5 h-5 text-surface-500" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-surface-900">Sound Analysis</h2>
                <p className="text-sm text-surface-500">Record the noise for better diagnosis</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Record */}
            {step === 'record' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-surface-600 mb-4">
                    Hold your device near the appliance and record the noise you're hearing.
                  </p>

                  {/* Recording visualization */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    {isRecording && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500/20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <div
                      className={cn(
                        'w-32 h-32 rounded-full flex items-center justify-center transition-colors',
                        isRecording ? 'bg-red-500' : 'bg-surface-100'
                      )}
                      style={isRecording ? {
                        boxShadow: `0 0 ${audioLevel * 50}px ${audioLevel * 20}px rgba(239, 68, 68, 0.3)`
                      } : {}}
                    >
                      {isRecording ? (
                        <MicOff className="w-12 h-12 text-white" />
                      ) : (
                        <Mic className="w-12 h-12 text-surface-400" />
                      )}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-2xl font-mono font-bold text-surface-900 mb-4">
                    {formatTime(recordingTime)}
                  </div>

                  {/* Audio level bars */}
                  {isRecording && (
                    <div className="flex items-end justify-center gap-1 h-8 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-red-500 rounded-full"
                          animate={{
                            height: `${Math.random() * audioLevel * 100 + 10}%`,
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isRecording ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      icon={<Mic className="w-5 h-5" />}
                      onClick={startRecording}
                    >
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      icon={<MicOff className="w-5 h-5" />}
                      onClick={stopRecording}
                    >
                      Stop Recording
                    </Button>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm text-surface-500 bg-surface-50 p-3 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Recording 10-30 seconds gives the best results. Try to minimize background noise.</span>
                </div>
              </div>
            )}

            {/* Step 2: Describe */}
            {step === 'describe' && (
              <div className="space-y-6">
                {/* Playback */}
                {audioUrl && (
                  <div className="bg-surface-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Play className="w-4 h-4" />}
                        onClick={() => audioRef.current?.play()}
                      >
                        Play
                      </Button>
                      <span className="text-sm text-surface-600">
                        Recording: {formatTime(recordingTime)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={deleteRecording}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                    <audio ref={audioRef} src={audioUrl} className="hidden" />
                  </div>
                )}

                {/* Sound type selection */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-3">
                    What type of sound is it?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOUND_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedSoundType(type.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          selectedSoundType === type.id
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-surface-200 hover:border-surface-300'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{type.icon}</span>
                          <span className="font-medium text-surface-900">{type.label}</span>
                        </div>
                        <p className="text-xs text-surface-500 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional description */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="When does the sound occur? Is it constant or intermittent?"
                    className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={analyzeSound}
                  disabled={!selectedSoundType}
                >
                  Analyze Sound
                </Button>
              </div>
            )}

            {/* Step 3: Analyzing */}
            {step === 'analyze' && (
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-brand-200"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Waves className="w-8 h-8 text-brand-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">Analyzing Sound...</h3>
                <p className="text-surface-500">Our AI is processing your recording</p>
              </div>
            )}

            {/* Step 4: Result */}
            {step === 'result' && analysisResult && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Analysis Complete</span>
                </div>

                <div className="bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info">
                      {SOUND_TYPES.find(s => s.id === selectedSoundType)?.label} Sound
                    </Badge>
                    <Badge variant="outline">{formatTime(recordingTime)} recording</Badge>
                  </div>
                  <p className="text-surface-700 leading-relaxed">{analysisResult}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setStep('record');
                      deleteRecording();
                      setSelectedSoundType(null);
                      setDescription('');
                      setAnalysisResult(null);
                    }}
                  >
                    Record Again
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleComplete}
                  >
                    Use in Diagnosis
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SoundAnalysis;
