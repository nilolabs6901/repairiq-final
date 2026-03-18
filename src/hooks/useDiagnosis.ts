'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, RepairSession, DiagnosticStage, DiagnosisResult } from '@/types';
import { saveSession, getSession, setCurrentSessionId, saveRepair } from '@/lib/storage';
import { INITIAL_GREETING, getStageFromMessageCount } from '@/lib/prompts';
import { getCachedDiagnosis, cacheDiagnosis } from '@/lib/cache';
import { API_BASE_URL } from '@/lib/config';

export function useDiagnosis(sessionId?: string) {
  const [session, setSession] = useState<RepairSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load session
  useEffect(() => {
    if (sessionId) {
      const existingSession = getSession(sessionId);
      if (existingSession) {
        setSession(existingSession);
        return;
      }
    }

    // Create new session
    const newSession: RepairSession = {
      id: sessionId || uuidv4(),
      messages: [
        {
          id: uuidv4(),
          role: 'assistant',
          content: INITIAL_GREETING,
          timestamp: new Date(),
        },
      ],
      stage: 'initial',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSession(newSession);
    saveSession(newSession);
    setCurrentSessionId(newSession.id);
  }, [sessionId]);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!session) return;

      setError(null);
      
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
        images,
      };

      // Update session with user message
      const updatedMessages = [...session.messages, userMessage];
      const newStage = getStageFromMessageCount(updatedMessages.filter(m => m.role === 'user').length);

      const updatedSession: RepairSession = {
        ...session,
        messages: updatedMessages,
        stage: newStage,
        updatedAt: new Date(),
        itemName: session.itemName || content.slice(0, 50),
      };

      setSession(updatedSession);
      saveSession(updatedSession);
      setIsLoading(true);

      try {
        // Check cache first for similar diagnoses (only after a few messages)
        const hasImages = images && images.length > 0;
        const messageCount = updatedMessages.filter(m => m.role === 'user').length;

        // Only check cache if we have enough context and no images (images need fresh analysis)
        if (!hasImages && messageCount >= 3) {
          const cached = getCachedDiagnosis(updatedMessages);
          if (cached) {
            console.log(`[Cache Hit] Similar diagnosis found (${cached.hitCount} previous hits)`);

            // Create a cached response message
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: `Based on similar repair questions we've handled, I've found a matching diagnosis for you!\n\n${cached.result.summary}`,
              timestamp: new Date(),
            };

            const finalSession: RepairSession = {
              ...updatedSession,
              messages: [...updatedMessages, assistantMessage],
              stage: 'complete',
              result: cached.result,
              updatedAt: new Date(),
            };

            setSession(finalSession);
            saveSession(finalSession);
            saveRepair(cached.result);
            setIsLoading(false);
            return;
          }
        }

        // Call API
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
            sessionId: session.id,
            images,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();

        // Update session with assistant response
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
        };

        const finalSession: RepairSession = {
          ...updatedSession,
          messages: [...updatedMessages, assistantMessage],
          stage: data.stage || newStage,
          result: data.result || undefined,
          updatedAt: new Date(),
        };

        setSession(finalSession);
        saveSession(finalSession);

        // Cache and auto-save the result if we got a diagnosis
        if (data.result) {
          cacheDiagnosis(updatedMessages, data.result);
          saveRepair(data.result);
          console.log('[Cache Store] Diagnosis cached and auto-saved for future reference');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const resetSession = useCallback(() => {
    const newSession: RepairSession = {
      id: uuidv4(),
      messages: [
        {
          id: uuidv4(),
          role: 'assistant',
          content: INITIAL_GREETING,
          timestamp: new Date(),
        },
      ],
      stage: 'initial',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSession(newSession);
    saveSession(newSession);
    setCurrentSessionId(newSession.id);
    setError(null);
  }, []);

  return {
    session,
    messages: session?.messages || [],
    stage: session?.stage || 'initial',
    result: session?.result,
    isLoading,
    error,
    sendMessage,
    resetSession,
  };
}

export default useDiagnosis;
