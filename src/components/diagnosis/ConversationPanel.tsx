'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { MessageBubble, TypingIndicator } from './MessageBubble';

interface ConversationPanelProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
  onOptionSelect?: (option: string) => void;
}

export function ConversationPanel({ messages, isTyping, className, onOptionSelect }: ConversationPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={cn('flex-1 overflow-y-auto p-4 md:p-6 space-y-4', className)}>
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            onOptionSelect={onOptionSelect}
          />
        ))}
        {isTyping && <TypingIndicator key="typing" />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}

export default ConversationPanel;
