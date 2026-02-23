'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { DiagnosisResult } from '@/types';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Wrench,
  Lightbulb,
  AlertTriangle,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';

interface RepairAssistantProps {
  result: DiagnosisResult;
  currentStep?: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'What tools do I need?', icon: Wrench },
  { label: 'Is this safe to do myself?', icon: AlertTriangle },
  { label: 'Can you explain this step?', icon: Lightbulb },
  { label: 'What if this doesn\'t work?', icon: Sparkles },
];

export function RepairAssistant({ result, currentStep = 0, isOpen, onClose }: RepairAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const step = result.troubleshootingSteps[currentStep];
      const initialMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I'm your repair assistant for the **${result.itemDescription}** repair. I have the full diagnosis loaded and I'm here to help you through each step.\n\n${step ? `You're currently on **Step ${step.stepNumber}: ${step.title}**. ` : ''}Ask me anything - whether you need tool recommendations, safety tips, clarification on a step, or troubleshooting help if something isn't going as expected.`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const step = result.troubleshootingSteps[currentStep];
      const repairContext = `I'm repairing my ${result.itemDescription}.
Diagnosis summary: ${result.summary}
Most likely issue: ${result.likelyIssues[0]?.title} - ${result.likelyIssues[0]?.description}
Difficulty: ${result.likelyIssues[0]?.difficulty}
${step ? `Current step (${step.stepNumber}/${result.troubleshootingSteps.length}): ${step.title} - ${step.description}` : ''}
${result.partsNeeded.length > 0 ? `Parts needed: ${result.partsNeeded.map(p => `${p.name} (${p.estimatedCost})`).join(', ')}` : ''}
Estimated total cost: ${result.estimatedTotalCost}
Estimated total time: ${result.estimatedTotalTime}`;

      const contextMessages = [
        ...(messages.length === 0 ? [{
          role: 'user' as const,
          content: `[Repair context: ${repairContext}]\n\n${content.trim()}`,
        }] : [
          {
            role: 'user' as const,
            content: `[Repair context: ${repairContext}]\n\nHi, I need help with this repair.`,
          },
          {
            role: 'assistant' as const,
            content: `I'm ready to help with your ${result.itemDescription} repair. What would you like to know?`,
          },
          ...messages.slice(1).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: content.trim() },
        ]),
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: contextMessages.map((m, i) => ({
            id: String(i),
            role: m.role,
            content: m.content,
            timestamp: new Date(),
          })),
          sessionId: `repair-assist-${result.id}`,
          voiceMode: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantContent = data.message?.content || 'Sorry, I had trouble understanding that. Could you rephrase?';

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Repair assistant error:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Try asking your question again, or check your internet connection.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          height: isMinimized ? 'auto' : undefined,
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={cn(
          'fixed z-50',
          'bottom-0 right-0 left-0 sm:bottom-4 sm:right-4 sm:left-auto sm:w-96 sm:max-w-[calc(100vw-2rem)]',
          isMinimized ? '' : 'h-[100dvh] sm:h-[500px] sm:max-h-[70vh]'
        )}
      >
        <Card padding="none" className="h-full flex flex-col shadow-2xl border-brand-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Repair Assistant</h3>
                <p className="text-white/70 text-xs">AI-powered help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors touch-manipulation"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-2',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] px-3 py-2 rounded-2xl text-sm',
                        message.role === 'user'
                          ? 'bg-brand-500 text-white rounded-br-md'
                          : 'bg-surface-100 text-surface-800 rounded-bl-md'
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-surface-600" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="bg-surface-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              {messages.length <= 1 && (
                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => sendMessage(prompt.label)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-50 hover:bg-surface-100 rounded-full text-xs text-surface-600 transition-colors"
                      >
                        <prompt.icon className="w-3 h-3" />
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-surface-200 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about this repair..."
                    className="flex-1 px-3 py-2 border border-surface-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    disabled={isLoading}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-4 h-4" />}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default RepairAssistant;
