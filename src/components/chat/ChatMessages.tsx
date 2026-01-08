'use client';

import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChat } from '@/hooks/useChat';

export function ChatMessages() {
  const { messages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="text-[#F7F8FF]/50 text-sm">
          <p className="mb-2">Welcome to TestForge Assistant!</p>
          <p>Ask me anything about the LLM test generation metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3"
      onWheel={(e) => {
        // Stop scroll propagation when scrolling messages
        e.stopPropagation();
      }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
