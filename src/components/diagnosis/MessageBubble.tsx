'use client';

import { motion } from 'framer-motion';
import { cn, formatTime } from '@/lib/utils';
import { parseMultipleChoiceOptions } from '@/lib/prompts';
import { Avatar } from '@/components/ui';
import { Message } from '@/types';
import { Wrench, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  onOptionSelect?: (option: string) => void;
}

export function MessageBubble({ message, isLast, onOptionSelect }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Parse multiple choice options for assistant messages
  const parsedOptions = !isUser ? parseMultipleChoiceOptions(message.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center">
            <User className="w-4 h-4 text-surface-500" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow">
            <Wrench className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-brand-500 text-white rounded-br-md'
              : 'bg-white border border-surface-100 text-surface-900 rounded-bl-md shadow-sm'
          )}
        >
          {/* Images if any */}
          {message.images && message.images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Uploaded image ${i + 1}`}
                  className="max-w-[200px] rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Text content */}
          <div className={cn(
            'prose prose-sm max-w-none',
            isUser ? 'prose-invert' : ''
          )}>
            {parsedOptions ? (
              // Render just the question text (without options)
              parsedOptions.text.split('\n').map((paragraph, i) => (
                <p key={i} className={cn(
                  'mb-2 last:mb-0',
                  isUser ? 'text-white' : 'text-surface-800'
                )}>
                  {paragraph}
                </p>
              ))
            ) : (
              // Regular message content
              message.content.split('\n').map((paragraph, i) => (
                <p key={i} className={cn(
                  'mb-2 last:mb-0',
                  isUser ? 'text-white' : 'text-surface-800'
                )}>
                  {paragraph}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Multiple Choice Options as Buttons */}
        {parsedOptions && parsedOptions.options.length > 0 && isLast && onOptionSelect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {parsedOptions.options.map((option) => (
              <button
                key={option.letter}
                onClick={() => onOptionSelect(`${option.letter}) ${option.text}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-surface-200 hover:border-brand-400 hover:bg-brand-50 rounded-xl text-sm font-medium text-surface-700 hover:text-brand-700 transition-all shadow-sm hover:shadow-md"
              >
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                  {option.letter}
                </span>
                <span>{option.text}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            'text-xs text-surface-400 mt-1',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow flex-shrink-0">
        <Wrench className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-surface-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="typing-indicator flex items-center gap-1">
          <span />
          <span />
          <span />
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
