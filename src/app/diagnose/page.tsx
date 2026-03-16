'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { shareDiagnosis } from '@/lib/shareResult';
import { hapticSuccess } from '@/lib/haptics';
import { Header } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import {
  ProgressIndicator,
  ConversationPanel,
  ChatInput,
  DiagnosisResults,
  OutcomeFeedback,
  VoiceGuidedDiagnosis,
} from '@/components/diagnosis';
import { VOICE_GREETING } from '@/lib/prompts';
import { useDiagnosis } from '@/hooks';
import { saveRepair, isRepairSaved, deleteSavedRepair, saveOutcome } from '@/lib/storage';
import { RepairOutcome } from '@/types';
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Share2,
  Mic,
} from 'lucide-react';

export default function DiagnosePage() {
  const router = useRouter();
  const { session, messages, stage, result, isLoading, error, sendMessage, resetSession } =
    useDiagnosis();
  const [showResults, setShowResults] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);

  // Check if repair is saved
  useEffect(() => {
    if (result) {
      setIsSaved(isRepairSaved(result.id));
    }
  }, [result]);

  // Show results when diagnosis is complete
  useEffect(() => {
    if (stage === 'complete' && result) {
      setShowResults(true);
    }
  }, [stage, result]);

  const handleSendMessage = (content: string, images?: string[]) => {
    sendMessage(content, images);
  };

  // Handle multiple choice option selection
  const handleOptionSelect = (option: string) => {
    if (!isLoading) {
      sendMessage(option);
    }
  };

  const handleReset = () => {
    resetSession();
    setShowResults(false);
    setIsSaved(false);
  };

  const handleSaveRepair = () => {
    if (result) {
      if (isSaved) {
        deleteSavedRepair(result.id);
        setIsSaved(false);
      } else {
        saveRepair(result);
        setIsSaved(true);
      }
    }
  };

  const handleShareRepair = async () => {
    if (result) {
      try {
        await shareDiagnosis(result);
        hapticSuccess();
      } catch {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(result.summary);
        alert('Diagnosis copied to clipboard!');
      }
    }
  };

  const handleReportOutcome = () => {
    setShowOutcomeModal(true);
  };

  const handleOutcomeSubmit = (outcome: RepairOutcome) => {
    saveOutcome(outcome);
    setShowOutcomeModal(false);
  };

  // Handle voice mode message sending - calls API directly for voice mode with simpler prompts
  const handleVoiceSendMessage = async (content: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }],
          sessionId: session?.id || 'voice-session',
          voiceMode: true, // Use simpler voice-optimized prompts
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Also update the text chat with this message
      sendMessage(content);

      return data.message?.content || "I'm here to help. Can you tell me more about the problem?";
    } catch (error) {
      console.error('Voice message error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto h-[calc(100dvh-4rem)] flex flex-col">
          {/* Top Bar */}
          <div className="px-4 py-4 border-b border-surface-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                    Back
                  </Button>
                </Link>
                <div className="hidden sm:block h-6 w-px bg-surface-200" />
                <h1 className="hidden sm:block font-display font-semibold text-surface-900">
                  {session?.itemName || 'New Diagnosis'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {showResults && result && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResults(false)}
                  >
                    Back to Chat
                  </Button>
                )}
                {!showResults && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Mic className="w-4 h-4" />}
                    onClick={() => setShowVoiceMode(true)}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-md"
                  >
                    🎙️ Voice Mode
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleReset}
                >
                  New
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator stage={stage} />
          </div>

          {/* Chat or Results */}
          <AnimatePresence mode="wait">
            {showResults && result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto p-4 md:p-8"
              >
                <DiagnosisResults
                  result={result}
                  onSave={handleSaveRepair}
                  onShare={handleShareRepair}
                  onReportOutcome={handleReportOutcome}
                  isSaved={isSaved}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Messages */}
                <ConversationPanel
                  messages={messages}
                  isTyping={isLoading}
                  className="flex-1"
                  onOptionSelect={handleOptionSelect}
                />

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mx-4"
                    >
                      <Card padding="sm" className="bg-rose-50 border-rose-200 mb-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-rose-500" />
                          <div className="flex-1">
                            <p className="text-sm text-rose-700">{error}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendMessage(messages[messages.length - 1]?.content || '')}
                          >
                            Retry
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Diagnosis Complete Banner */}
                <AnimatePresence>
                  {stage === 'complete' && result && !showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mx-4"
                    >
                      <Card
                        padding="md"
                        className="bg-gradient-to-r from-brand-50 to-brand-100 border-brand-200 mb-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-brand-900">Diagnosis Complete!</p>
                              <p className="text-sm text-brand-700">
                                We have identified the issue and prepared a repair guide.
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="md"
                            icon={<Sparkles className="w-4 h-4" />}
                            onClick={() => setShowResults(true)}
                          >
                            View Results
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input */}
                <div className="p-4 border-t border-surface-100 bg-white pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isLoading}
                    placeholder={
                      stage === 'initial'
                        ? "Describe what's broken..."
                        : 'Type your response...'
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Outcome Feedback Modal */}
      {result && (
        <OutcomeFeedback
          diagnosisId={result.id}
          isOpen={showOutcomeModal}
          onClose={() => setShowOutcomeModal(false)}
          onSubmit={handleOutcomeSubmit}
        />
      )}

      {/* Voice-Guided Diagnosis Modal */}
      <AnimatePresence>
        {showVoiceMode && (
          <VoiceGuidedDiagnosis
            onClose={() => setShowVoiceMode(false)}
            onSendMessage={handleVoiceSendMessage}
            initialGreeting={VOICE_GREETING}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
