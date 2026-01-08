"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isEmpty = !message.content || message.content.trim() === "";

  // Don't render system messages
  if (isSystem) return null;

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2.5 text-sm",
          isUser
            ? "bg-[#F7931E] text-white"
            : "bg-[#101421] border border-[#222736] text-[#F7F8FF]"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : isEmpty ? (
          <div className="text-[#F7F8FF]/70 italic">
            <p className="mb-2">I received an empty response. This usually happens when:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>The server was restarted with old chat history</li>
              <li>There was a temporary API issue</li>
            </ul>
            <p className="mt-2 text-sm">
              <strong className="text-[#F7931E]">Try this:</strong> Click the trash icon above to clear the chat, then ask your question again.
            </p>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-[#F7931E]">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-[#F7F8FF]">{children}</li>,
                code: ({ children }) => <code className="bg-[#050711] px-1.5 py-0.5 rounded text-[#F7931E]">{children}</code>,
                table: ({ children }) => (
                  <table className="w-full border-collapse border border-[#222736] my-3 text-sm">
                    {children}
                  </table>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#050711]">{children}</thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr className="border-b border-[#222736]">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold text-[#F7931E] border-r border-[#222736] last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-[#F7F8FF] border-r border-[#222736] last:border-r-0">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {message.isStreaming && (
          <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <div className="size-1 rounded-full bg-current animate-pulse" />
            <div className="size-1 rounded-full bg-current animate-pulse delay-75" />
            <div className="size-1 rounded-full bg-current animate-pulse delay-150" />
          </div>
        )}
      </div>
    </div>
  );
}
