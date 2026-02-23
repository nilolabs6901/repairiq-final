'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Send, Image, X, Paperclip, Loader2, Mic, MicOff, Camera, Video } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

// Voice recognition hook with ref-based deduplication
function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const lastTranscriptRef = useRef<string>(''); // Track last transcript to prevent duplicates

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          // Only append new final transcripts to prevent repetition
          if (finalTranscript && finalTranscript !== lastTranscriptRef.current) {
            lastTranscriptRef.current = finalTranscript;
            setTranscript((prev) => {
              const newText = prev ? `${prev} ${finalTranscript}` : finalTranscript;
              return newText.trim();
            });
          } else if (interimTranscript) {
            // Show interim results but don't save them
            setTranscript((prev) => {
              const base = lastTranscriptRef.current || prev;
              return base ? `${base} ${interimTranscript}` : interimTranscript;
            });
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      lastTranscriptRef.current = ''; // Reset on new session
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    lastTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}

export function ChatInput({ onSend, disabled, placeholder = "Describe what's broken..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, transcript, isSupported, startListening, stopListening, clearTranscript } = useVoiceInput();

  // Sync voice transcript to message input
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const handleSubmit = useCallback(() => {
    if ((!message.trim() && images.length === 0) || disabled) return;
    onSend(message.trim(), images.length > 0 ? images : undefined);
    setMessage('');
    setImages([]);
    clearTranscript(); // Clear voice transcript on send
    if (isListening) stopListening();
  }, [message, images, disabled, onSend, clearTranscript, isListening, stopListening]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
    setIsDragging(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 4,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />
      
      {/* Drop overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-50 border-2 border-dashed border-brand-400 rounded-2xl flex items-center justify-center z-10"
          >
            <div className="text-center">
              <Image className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <p className="text-brand-600 font-medium">Drop images here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Image previews */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 border-b border-surface-100"
            >
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative group"
                  >
                    <img
                      src={img}
                      alt={`Preview ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-surface-200"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-surface-900 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="flex items-end gap-2 p-2">
          <button
            onClick={open}
            disabled={disabled || images.length >= 4}
            className={cn(
              'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors touch-manipulation',
              disabled || images.length >= 4
                ? 'text-surface-300 cursor-not-allowed'
                : 'text-surface-400 hover:bg-surface-100 hover:text-surface-600'
            )}
            title="Upload photo or video of the problem"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Voice input button */}
          {isSupported && (
            <button
              onClick={toggleVoice}
              disabled={disabled}
              className={cn(
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors touch-manipulation',
                isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : disabled
                  ? 'text-surface-300 cursor-not-allowed'
                  : 'text-surface-400 hover:bg-surface-100 hover:text-surface-600'
              )}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent py-2 px-2',
              'text-base sm:text-sm text-surface-900 placeholder:text-surface-400',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{ minHeight: '40px', maxHeight: '150px' }}
          />

          <Button
            onClick={handleSubmit}
            disabled={disabled || (!message.trim() && images.length === 0)}
            variant="primary"
            size="md"
            className="rounded-xl"
            icon={
              disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )
            }
          />
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-surface-500 flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-brand-600">
            <Camera className="w-3 h-3" />
            Photo/Video
          </span>
          <span className="text-surface-300">•</span>
          {isSupported && (
            <>
              <span className="inline-flex items-center gap-1 text-brand-600">
                <Mic className="w-3 h-3" />
                Voice
              </span>
              <span className="text-surface-300">•</span>
            </>
          )}
          <span>Type or drag images</span>
        </p>
      </div>

      {/* Voice listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-2 mt-2 text-red-600"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatInput;
