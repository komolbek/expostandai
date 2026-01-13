'use client'

import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex animate-fade-in-up',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]',
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
        )}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  )
}
