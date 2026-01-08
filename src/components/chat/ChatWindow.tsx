"use client";

import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ExperimentalWarning } from "./ExperimentalWarning";
import { useChat } from "@/hooks/useChat";
import { useDraggable } from "@/hooks/useDraggable";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const {
    hasSeenWarning,
    position: savedPosition,
    addMessage,
    setLoading,
    isLoading,
    dismissWarning,
    closeChat,
    setPosition: savePosition,
  } = useChat();

  const filters = useFilters();

  // Initialize draggable behavior
  const {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
  } = useDraggable({
    initialPosition: savedPosition || undefined,
    bounds: {
      left: 0,
      top: 0,
      right: typeof window !== 'undefined' ? window.innerWidth - 400 : 0,
      bottom: typeof window !== 'undefined' ? window.innerHeight - 600 : 0,
    },
    onDragEnd: (pos) => {
      // Save position to store when drag ends
      savePosition(pos);
    },
  });

  const handleSendMessage = async (content: string) => {
    try {
      setLoading(true);
      addMessage({ role: "user", content });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: useChat.getState().messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            sourceLanguage: filters.sourceLanguage,
            llm: filters.llm,
            promptStrategy: filters.promptStrategy,
            complexity: filters.complexity,
            testType: filters.testType,
            metricView: filters.metricView,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      addMessage({ role: "assistant", content: data.message });
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sorry, I encountered an error. Please try again.";
      addMessage({ role: "assistant", content: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = () => {
    // User clicked "Let's explore" - permanently dismiss warning and keep chat open
    dismissWarning(); // Saves to localStorage - won't show again
  };

  const handleCloseWarning = () => {
    // User clicked X - close chat but DON'T dismiss warning (will show again next time)
    closeChat();
  };

  return (
    <>
      {/* Blocking warning modal */}
      {!hasSeenWarning && (
        <ExperimentalWarning
          onExplore={handleExplore}
          onClose={handleCloseWarning}
        />
      )}

      {/* Draggable chat window */}
      <Card
        ref={elementRef}
        onMouseDown={handleMouseDown}
        onWheel={(e) => {
          // Stop scroll propagation to prevent affecting dashboard scroll
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Prevent clicks from passing through to dashboard
          e.stopPropagation();
        }}
        className={cn(
          "fixed z-100 backdrop-blur-xl border-[#222736] transition-all duration-300 flex flex-col",
          "w-[400px] h-[600px]",
          isDragging && "select-none",
          !isDragging && "shadow-xl"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          backgroundColor: "rgba(5, 7, 17, 0.85)",
          boxShadow: isDragging
            ? "0 12px 48px rgba(0, 0, 0, 0.5), 0 0 120px rgba(247, 147, 30, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(247, 147, 30, 0.15)",
          pointerEvents: "auto", // Ensure chat captures all pointer events
        }}
        role="dialog"
        aria-label="TestForge Assistant Chatbot"
        aria-describedby="chat-description"
      >
        <span id="chat-description" className="sr-only">
          Experimental AI assistant for analyzing LLM test generation metrics.
          You can drag this window to reposition it.
        </span>

        <ChatHeader />
        <ChatMessages />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </Card>
    </>
  );
}
