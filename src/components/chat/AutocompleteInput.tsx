'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Suggestion {
  value: string;
  label: string;
  category: string;
}

// All available entities for autocomplete
const SUGGESTIONS: Suggestion[] = [
  // LLMs
  { value: 'Llama3.3:70b', label: 'Llama3.3:70b', category: 'LLM' },
  { value: 'Qwen3:32b', label: 'Qwen3:32b', category: 'LLM' },
  { value: 'Qwen2.5-coder:14b', label: 'Qwen2.5-coder:14b', category: 'LLM' },
  { value: 'Qwen3:4b', label: 'Qwen3:4b', category: 'LLM' },

  // Prompt Strategies
  { value: 'zero_shot', label: 'zero-shot', category: 'Prompt' },
  { value: 'few_shot', label: 'few-shot', category: 'Prompt' },
  { value: 'chain_of_thought', label: 'chain-of-thought', category: 'Prompt' },

  // Complexity
  { value: 'Easy', label: 'Easy', category: 'Complexity' },
  { value: 'Moderate', label: 'Moderate', category: 'Complexity' },
  { value: 'Hard', label: 'Hard', category: 'Complexity' },

  // Test Types
  { value: 'standard', label: 'standard', category: 'Test Type' },
  { value: 'boundary', label: 'boundary', category: 'Test Type' },
  { value: 'mix', label: 'mix', category: 'Test Type' },
];

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function AutocompleteInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  maxLength,
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current word being typed at cursor position
  const getCurrentWord = () => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';
    const wordStart = textBeforeCursor.length - currentWord.length;

    return { word: currentWord, start: wordStart, end: cursorPosition };
  };

  // Filter suggestions based on current word
  useEffect(() => {
    const { word } = getCurrentWord();

    if (word.length < 2) {
      setShowSuggestions(false);
      return;
    }

    const searchTerm = word.toLowerCase().replace(/[_-]/g, '');
    const matches = SUGGESTIONS.filter(
      (suggestion) =>
        suggestion.value.toLowerCase().replace(/[_:-]/g, '').includes(searchTerm) ||
        suggestion.label.toLowerCase().replace(/[_-]/g, '').includes(searchTerm)
    );

    if (matches.length > 0) {
      setFilteredSuggestions(matches);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, cursorPosition]);

  // Handle suggestion selection
  const selectSuggestion = (suggestion: Suggestion) => {
    const { word, start, end } = getCurrentWord();
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newValue = `${before}${suggestion.value}${after}`;

    onChange(newValue);
    setShowSuggestions(false);

    // Move cursor to end of inserted text
    setTimeout(() => {
      const newCursorPos = start + suggestion.value.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          selectSuggestion(filteredSuggestions[selectedIndex]);
        } else {
          onSubmit();
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Track cursor position
  const handleSelect = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onClick={handleSelect}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full px-4 py-2.5 rounded-lg bg-[#101421] border border-[#222736] text-[#F7F8FF] placeholder:text-[#F7F8FF]/40 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/50 focus:border-[#F7931E] disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[42px]"
      />

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-[#101421] border border-[#222736] rounded-lg shadow-xl max-h-[240px] overflow-y-auto z-50"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.category}-${suggestion.value}`}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                index === selectedIndex
                  ? 'bg-[#F7931E]/10 text-[#F7931E]'
                  : 'text-[#F7F8FF] hover:bg-[#1a1f2e]'
              }`}
            >
              <span className="text-sm font-mono">{suggestion.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1f2e] text-[#F7F8FF]/50">
                {suggestion.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
