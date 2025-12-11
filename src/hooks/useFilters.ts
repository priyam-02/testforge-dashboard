import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FilterState, LLMType, PromptType, TestType, Complexity, MetricView } from '@/types/metrics';

interface FilterStore extends FilterState {
  setLLM: (llm: LLMType | null) => void;
  setPromptStrategy: (promptStrategy: PromptType | null) => void;
  setComplexity: (complexity: Complexity | null) => void;
  setTestType: (testType: TestType | null) => void;
  setMetricView: (metricView: MetricView) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialState: FilterState = {
  sourceLanguage: 'Java', // Currently only Java, but prepared for future expansion
  llm: null,
  promptStrategy: null,
  complexity: null,
  testType: null,
  metricView: 'test-set',
};

export const useFilters = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLLM: (llm) => set({ llm }),

      setPromptStrategy: (promptStrategy) => set({ promptStrategy }),

      setComplexity: (complexity) => set({ complexity }),

      setTestType: (testType) => set({ testType }),

      setMetricView: (metricView) => set({ metricView }),

      clearFilters: () => set({
        llm: null,
        promptStrategy: null,
        complexity: null,
        testType: null,
      }),

      hasActiveFilters: () => {
        const state = get();
        return !!(
          state.llm ||
          state.promptStrategy ||
          state.complexity ||
          state.testType
        );
      },
    }),
    {
      name: 'testforge-filters',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
