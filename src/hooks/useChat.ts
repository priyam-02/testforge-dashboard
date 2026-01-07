import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
}

interface ChatStore extends ChatState {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearHistory: () => void;
  setLoading: (isLoading: boolean) => void;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
};

export const useChat = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          },
        ],
      })),

      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content,
          };
        }
        return { messages };
      }),

      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

      openChat: () => set({ isOpen: true }),

      closeChat: () => set({ isOpen: false }),

      clearHistory: () => set({ messages: [] }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'testforge-chat-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }), // Only persist messages
    }
  )
);
