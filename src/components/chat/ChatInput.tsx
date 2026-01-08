'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/hooks/useFilters';
import { AutocompleteInput } from './AutocompleteInput';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

// Context-aware suggested questions
function getSuggestedQuestions(filters: ReturnType<typeof useFilters.getState>) {
  const { llm, promptStrategy, complexity, testType } = filters;

  // With LLM filter
  if (llm) {
    return [
      `How does ${llm} compare to other models?`,
      `What's the best prompt strategy for ${llm}?`,
      `Show ${llm} performance on ${complexity || 'hard'} problems`,
    ];
  }

  // With prompt strategy filter
  if (promptStrategy) {
    return [
      `Which LLM works best with ${promptStrategy}?`,
      `Compare ${promptStrategy} to other strategies`,
      `How does ${promptStrategy} affect coverage?`,
    ];
  }

  // With test type filter
  if (testType) {
    return [
      `Which LLM performs best on ${testType} tests?`,
      `Compare ${testType} to other test types`,
      `How does complexity affect ${testType} tests?`,
    ];
  }

  // No filters - general questions
  return [
    'Which LLM has the best overall performance?',
    'How does prompt strategy affect success rates?',
    'Compare performance across complexity levels',
  ];
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const filters = useFilters();
  const suggestedQuestions = getSuggestedQuestions(filters);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = useCallback((question: string) => {
    if (!isLoading) {
      onSend(question);
      setExpandedCard(null); // Reset expansion after sending
    }
  }, [isLoading, onSend]);

  // Keyboard shortcuts for quick-send
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;
      if (['1', '2', '3'].includes(key)) {
        const index = parseInt(key) - 1;
        if (suggestedQuestions[index] && !isLoading) {
          handleSuggestionClick(suggestedQuestions[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [suggestedQuestions, isLoading, handleSuggestionClick]);

  return (
    <div className="border-t border-[#222736] p-4 space-y-2.5">
      {/* Starfield Command Cards - Terminal Style */}
      {suggestedQuestions.length > 0 && (
        <div className="flex flex-col gap-1">
          {suggestedQuestions.map((question, index) => {
            const isExpanded = expandedCard === index;
            const truncatedQuestion = question.length > 45
              ? question.substring(0, 45) + '...'
              : question;

            return (
              <button
                key={index}
                onClick={() => {
                  if (isExpanded) {
                    // Second click - send question
                    handleSuggestionClick(question);
                  } else {
                    // First click - expand card
                    setExpandedCard(index);
                  }
                }}
                disabled={isLoading}
                className={cn(
                  // Base styles
                  "relative w-full text-left px-3 py-2 rounded-md border transition-all duration-300 font-mono text-xs",
                  // Background with subtle gradient
                  "bg-gradient-to-r from-[#101421] to-[#0a0e1a]",
                  // Border with glow effect
                  "border-[#222736]",
                  // Hover state
                  "hover:border-[#F7931E]/50 hover:shadow-lg hover:shadow-[#F7931E]/10",
                  "hover:translate-y-[-2px]",
                  // Expanded state
                  isExpanded && "border-[#F7931E] shadow-lg shadow-[#F7931E]/20",
                  // Disabled state
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                {/* Scan-line effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F7931E]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md" />

                {/* Content */}
                <div className="relative z-10 flex items-start gap-2">
                  {/* Terminal prompt with monospace number */}
                  <span className="text-[#F7931E] shrink-0 font-mono">
                    &gt; {index + 1}.
                  </span>

                  {/* Question text */}
                  <span className={cn(
                    "text-[#F7F8FF]/70 leading-relaxed",
                    isExpanded && "text-[#F7F8FF]"
                  )}>
                    {isExpanded ? question : truncatedQuestion}
                  </span>
                </div>

                {/* Expansion indicator */}
                {!isExpanded && question.length > 45 && (
                  <div className="absolute right-2 bottom-1 text-[9px] text-[#F7931E]/50 font-sans">
                    Click to expand
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Input Form - Aligned with Autocomplete */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <AutocompleteInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Ask about the metrics data... (type to see entity suggestions)"
          disabled={isLoading}
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="bg-[#F7931E] hover:bg-[#F7931E]/90 text-white shrink-0 h-[42px] w-[42px]"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
