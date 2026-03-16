'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { Card, Badge, Button } from '@/components/ui';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Settings,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface VoiceGuidedDiagnosisProps {
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
  initialGreeting: string;
}

// Speech Recognition type
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string; confidence: number } } } }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
};

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function VoiceGuidedDiagnosis({
  onClose,
  onSendMessage,
  initialGreeting,
}: VoiceGuidedDiagnosisProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(false);
  const [elevenLabsChecked, setElevenLabsChecked] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if ElevenLabs is available
  useEffect(() => {
    const checkElevenLabs = async () => {
      try {
        console.log('Checking ElevenLabs availability...');
        const response = await fetch(`${API_BASE_URL}/api/elevenlabs`, {
          method: 'GET',
        });
        const data = await response.json();
        console.log('ElevenLabs check response:', data);
        setElevenLabsAvailable(data.available === true);
        if (data.available) {
          console.log('ElevenLabs is available - premium voice enabled');
        } else {
          console.log('ElevenLabs not available:', data.reason);
        }
      } catch (e) {
        console.log('ElevenLabs check failed:', e);
        setElevenLabsAvailable(false);
      } finally {
        setElevenLabsChecked(true);
      }
    };
    checkElevenLabs();
  }, []);

  // Speak using ElevenLabs API
  const speakWithElevenLabs = useCallback(async (text: string, onEnd?: () => void) => {
    try {
      setIsSpeaking(true);

      // Clean the text for speech
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/📸|•|#/g, '')
        .replace(/[A-E]\)/g, 'Option ')
        .trim();

      const response = await fetch(`${API_BASE_URL}/api/elevenlabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
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
        onEnd?.();
      };

      await audio.play();
    } catch (e) {
      console.error('ElevenLabs speech error:', e);
      setIsSpeaking(false);
      // Fallback to browser speech synthesis
      speakWithBrowser(text, onEnd);
    }
  }, [speechRate]);

  // Speak using browser speech synthesis (fallback)
  const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || !voiceSupported) {
      onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean the text for speech (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/📸|•|#/g, '')
      .replace(/[A-E]\)/g, 'Option ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a good English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

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

  // Stop speaking
  const stopSpeaking = useCallback(() => {
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
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already running, ignore
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Process and send the user's message
  const processUserMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsProcessing(true);
    setError(null);

    // Add user message to conversation
    const userMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Get AI response
      const response = await onSendMessage(userMessage);

      // Add assistant message to conversation
      const assistantMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Speak the response
      speak(response, () => {
        // Auto-start listening after speaking if enabled
        if (autoListen && speechSupported) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      });
    } catch (e) {
      setError('Failed to get response. Please try again.');
      console.error('Error processing message:', e);
    } finally {
      setIsProcessing(false);
    }
  }, [onSendMessage, speak, autoListen, speechSupported, startListening]);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech synthesis support
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        setVoiceSupported(true);

        // Load voices
        const loadVoices = () => {
          window.speechSynthesis.getVoices();
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Check for speech recognition support
      const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionType; webkitSpeechRecognition?: new () => SpeechRecognitionType }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionType }).webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimText += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(finalTranscript);
            setInterimTranscript('');
          } else {
            setInterimTranscript(interimText);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event);
          setIsListening(false);
          setError('Could not understand. Please try again.');
        };

        recognition.onend = () => {
          setIsListening(false);
          // Process the final transcript if we have one
          if (transcript) {
            processUserMessage(transcript);
            setTranscript('');
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
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Process transcript when it changes
  useEffect(() => {
    if (transcript && !isListening) {
      processUserMessage(transcript);
      setTranscript('');
    }
  }, [transcript, isListening, processUserMessage]);

  // Speak initial greeting on mount (wait for ElevenLabs check to complete)
  useEffect(() => {
    if (voiceSupported && initialGreeting && elevenLabsChecked) {
      // Add initial greeting to messages
      const greetingMsg: ConversationMessage = {
        id: 'greeting',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date(),
      };
      setMessages([greetingMsg]);

      console.log('Speaking initial greeting with:', elevenLabsAvailable ? 'ElevenLabs' : 'Browser TTS');

      // Speak it
      setTimeout(() => {
        speak(initialGreeting, () => {
          if (autoListen && speechSupported) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        });
      }, 500);
    }
  }, [voiceSupported, initialGreeting, elevenLabsChecked]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  }, [isListening, stopListening, stopSpeaking, startListening]);

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
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              <h2 className="font-semibold">Voice-Guided Diagnosis</h2>
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
          <p className="text-violet-100 text-sm">
            Speak naturally to describe your repair issue. I'll listen and respond with voice.
          </p>
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
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-surface-600 w-12">{speechRate}x</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-surface-700">Auto-listen after response:</label>
                <button
                  onClick={() => setAutoListen(!autoListen)}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    autoListen ? 'bg-violet-500' : 'bg-surface-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                      autoListen ? 'translate-x-5' : 'translate-x-1'
                    )}
                  />
                </button>
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
                      useElevenLabs ? 'bg-violet-500' : 'bg-surface-300'
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

        {/* Conversation area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-violet-500 text-white rounded-br-md'
                    : 'bg-white border border-surface-200 text-surface-900 rounded-bl-md'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                <span className="text-surface-500">Thinking...</span>
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Current transcript display */}
        {(isListening || interimTranscript) && (
          <div className="px-4 py-2 bg-violet-50 border-t border-violet-100">
            <p className="text-sm text-violet-700">
              {interimTranscript || transcript || 'Listening...'}
            </p>
          </div>
        )}

        {/* Voice control footer */}
        <div className="border-t border-surface-200 p-4 bg-white">
          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {isSpeaking && (
              <div className="flex items-center gap-2 text-violet-600">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Speaking...</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Listening...</span>
              </div>
            )}
            {!isSpeaking && !isListening && !isProcessing && (
              <div className="flex items-center gap-2 text-surface-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ready - tap the microphone to speak</span>
              </div>
            )}
          </div>

          {/* Main controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Stop speaking button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-3 rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
                title="Stop speaking"
              >
                <VolumeX className="w-6 h-6" />
              </button>
            )}

            {/* Main mic button */}
            <button
              onClick={toggleListening}
              disabled={isProcessing || isSpeaking}
              className={cn(
                'p-6 rounded-full transition-all transform',
                isListening
                  ? 'bg-red-500 text-white scale-110 animate-pulse'
                  : isProcessing || isSpeaking
                  ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600 hover:scale-105'
              )}
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            {/* Switch to text mode */}
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
              title="Switch to text input"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-surface-400 mt-3">
            {speechSupported
              ? 'Tap the microphone and speak your repair issue'
              : 'Voice input not supported in your browser'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default VoiceGuidedDiagnosis;
