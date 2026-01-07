'use client';

import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useFilters } from '@/hooks/useFilters';
import { formatFilterContext } from '@/lib/chat/prompts';

export function ChatHeader() {
  const { closeChat, clearHistory, messages } = useChat();
  const filters = useFilters();
  const filterContext = formatFilterContext(filters);

  return (
    <div className="border-b border-[#222736] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-[#F7F8FF]">TestForge Assistant</h3>
        {filterContext !== 'No filters active (viewing all data)' && (
          <Badge variant="outline" className="text-xs">
            {filterContext}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearHistory}
            className="text-[#F7F8FF]/70 hover:text-[#F7F8FF]"
            title="Clear chat history"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={closeChat}
          className="text-[#F7F8FF]/70 hover:text-[#F7F8FF]"
          title="Close chat"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
