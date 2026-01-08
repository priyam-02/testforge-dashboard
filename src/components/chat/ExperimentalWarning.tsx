'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExperimentalWarningProps {
  onExplore: () => void; // "Let's explore" button - dismiss warning, keep chat open
  onClose: () => void;   // X button - close warning AND chat window
}

export function ExperimentalWarning({ onExplore, onClose }: ExperimentalWarningProps) {
  // Block body scroll when modal is open
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Block scroll and compensate for scrollbar
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Restore on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onWheel={(e) => {
        // Block all scroll events - nothing should happen
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        // Block all mouse interactions
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchMove={(e) => {
        // Block touch scrolling on mobile
        e.preventDefault();
      }}
      onClick={(e) => {
        // Clicking backdrop does nothing - modal is truly blocking
        e.stopPropagation();
        e.preventDefault();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warning-title"
      aria-describedby="warning-description"
    >
      <Card
        className="w-[440px] bg-[#101421] border-[#F7931E] border-2 p-0 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Block scroll within card too
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="flex items-start gap-4 p-6">
          <div className="shrink-0 rounded-full bg-[#F7931E]/20 p-3">
            <AlertTriangle className="size-6 text-[#F7931E]" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 id="warning-title" className="text-lg font-semibold text-[#F7F8FF]">
                Experimental Assistant
              </h3>
              <p id="warning-description" className="text-sm text-[#A6AEC8] mt-1">
                Before you start, please note:
              </p>
            </div>

            <ul className="space-y-2 text-sm text-[#F7F8FF]/90">
              <li className="flex gap-2">
                <span className="text-[#F7931E]">•</span>
                <span>This assistant is under active development</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#F7931E]">•</span>
                <span>Running on free tier - may stop after several questions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#F7931E]">•</span>
                <span>LLM can generate hallucinations - results may not be accurate</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#F7931E]">•</span>
                <span>Always verify numbers against the dashboard charts</span>
              </li>
            </ul>

            <Button
              onClick={onExplore}
              className="w-full bg-[#F7931E] hover:bg-[#F7931E]/90 text-white"
            >
              Got it, let&apos;s explore
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="shrink-0 text-[#A6AEC8] hover:text-[#F7F8FF]"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
