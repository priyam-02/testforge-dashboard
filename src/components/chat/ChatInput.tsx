'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/hooks/useFilters';

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
  const filters = useFilters();
  const suggestedQuestions = getSuggestedQuestions(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (question: string) => {
    if (!isLoading) {
      onSend(question);
    }
  };

  return (
    <div className="border-t border-[#222736] p-4 space-y-3">
      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-[#222736] bg-[#101421] text-[#F7F8FF]/70 hover:text-[#F7F8FF] hover:bg-[#1a1f2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the metrics data..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-[#101421] border border-[#222736] text-[#F7F8FF] placeholder:text-[#F7F8FF]/40 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/50 focus:border-[#F7931E] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="bg-[#F7931E] hover:bg-[#F7931E]/90 text-white shrink-0"
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
