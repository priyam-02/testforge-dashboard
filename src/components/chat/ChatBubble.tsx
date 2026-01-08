'use client';

import { useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from './ChatWindow';
import { cn } from '@/lib/utils';

export function ChatBubble() {
  const { isOpen, toggleChat, closeChat, messages } = useChat();
  const hasUnreadMessages = messages.length > 0 && !isOpen;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Toggle chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleChat();
      }

      // Esc: Close chat (only if open)
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleChat, closeChat]);

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        size="icon-lg"
        className={cn(
          'fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-100 transition-all',
          'hover:scale-105 active:scale-95',
          hasUnreadMessages && 'animate-pulse'
        )}
        style={{ backgroundColor: '#F7931E' }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-keyshortcuts="Control+K"
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <>
            <MessageCircle className="size-6" />
            {hasUnreadMessages && (
              <span
                className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-[#050711]"
                aria-label="Unread messages"
              />
            )}
          </>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && <ChatWindow />}

      {/* Screen reader status announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isOpen && 'Chat window opened'}
      </div>
    </>
  );
}
