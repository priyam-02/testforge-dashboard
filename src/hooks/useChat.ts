import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  position: Position | null;
  hasSeenWarning: boolean;
}

interface ChatStore extends ChatState {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearHistory: () => void;
  setLoading: (isLoading: boolean) => void;
  setPosition: (position: Position) => void;
  resetPosition: () => void;
  dismissWarning: () => void;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  position: null,
  hasSeenWarning: false,
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

      setPosition: (position) => set({ position }),

      resetPosition: () => set({ position: null }),

      dismissWarning: () => set({ hasSeenWarning: true }),
    }),
    {
      name: 'testforge-chat-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
        position: state.position,
        // hasSeenWarning NOT persisted - warning shows on every page reload
      }), // Persist messages and position only (NOT isOpen or hasSeenWarning)
    }
  )
);
