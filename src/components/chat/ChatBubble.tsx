'use client';

import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from './ChatWindow';

export function ChatBubble() {
  const { isOpen, toggleChat } = useChat();

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        size="icon-lg"
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-100 transition-transform hover:scale-105"
        style={{ backgroundColor: '#F7931E' }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && <ChatWindow />}
    </>
  );
}
