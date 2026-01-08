'use client';

import { X, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { useFilters } from '@/hooks/useFilters';
import { cn } from '@/lib/utils';

/**
 * Format filter context for display in chat header
 * Note: These filters are shown for user reference only - the chatbot analyzes ALL data
 */
function formatFilterContext(filters: {
  llm?: string | null;
  promptStrategy?: string | null;
  complexity?: string | null;
  testType?: string | null;
}): string {
  const parts: string[] = [];

  if (filters.llm) {
    parts.push(`LLM: ${filters.llm}`);
  }
  if (filters.promptStrategy) {
    parts.push(`Prompt: ${filters.promptStrategy}`);
  }
  if (filters.complexity) {
    parts.push(`Complexity: ${filters.complexity}`);
  }
  if (filters.testType) {
    parts.push(`Test Type: ${filters.testType}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No filters active (viewing all data)';
}

export function ChatHeader() {
  const { closeChat, clearHistory, resetPosition, messages } = useChat();
  const filters = useFilters();
  const filterContext = formatFilterContext(filters);

  return (
    <div
      className="border-b border-[#222736] px-4 py-3"
      data-drag-handle // Enables dragging from header
    >
      <div className="flex items-center justify-between">
        {/* Left: Title + Beta badge - draggable */}
        <div
          className={cn(
            "flex items-center gap-2 cursor-grab active:cursor-grabbing",
            "hover:bg-[#F7931E]/8 -mx-2 px-2 py-1 rounded transition-colors"
          )}
          data-drag-handle // Allow dragging from this area
        >
          <h3 className="font-semibold text-[#F7F8FF]">TestForge Assistant</h3>

          {/* Beta badge with tooltip */}
          <div className="group relative">
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase tracking-wider border-[#F7931E]/30 text-[#F7931E] flex items-center gap-1"
            >
              <AlertTriangle className="size-3" />
              BETA
            </Badge>

            {/* Tooltip */}
            <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-[#101421] border border-[#F7931E]/30 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-xs">
              <p className="text-[#F7F8FF] mb-2 font-semibold">Experimental Feature</p>
              <ul className="space-y-1 text-[#A6AEC8]">
                <li>• Under development</li>
                <li>• Free tier - may stop</li>
                <li>• LLM hallucinations possible</li>
                <li>• Verify all numbers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
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
            onClick={resetPosition}
            className="text-[#F7F8FF]/70 hover:text-[#F7F8FF]"
            title="Reset position"
          >
            <RotateCcw className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeChat}
            className="text-[#F7F8FF]/70 hover:text-[#F7F8FF]"
            title="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filter context chips */}
      {filterContext !== 'No filters active (viewing all data)' && (
        <div className="mt-2">
          <Badge
            variant="outline"
            className="text-xs text-[#A6AEC8] border-[#222736]"
          >
            {filterContext}
          </Badge>
        </div>
      )}
    </div>
  );
}
