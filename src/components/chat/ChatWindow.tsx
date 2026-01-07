"use client";

import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { useFilters } from "@/hooks/useFilters";

export function ChatWindow() {
  const { addMessage, setLoading, isLoading } = useChat();
  const filters = useFilters();

  const handleSendMessage = async (content: string) => {
    try {
      setLoading(true);

      addMessage({ role: "user", content });

      const messages = useChat.getState().messages;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
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

      addMessage({
        role: "assistant",
        content: data.message,
      });
    } catch (err) {
      console.error("Chat error:", err);

      // Show the actual error message from the backend
      const errorMessage = err instanceof Error
        ? err.message
        : "Sorry, I encountered an error. Please try again.";

      addMessage({
        role: "assistant",
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] flex flex-col z-100 bg-[#050711] border-[#222736] shadow-2xl">
      <ChatHeader />
      <ChatMessages />
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </Card>
  );
}
