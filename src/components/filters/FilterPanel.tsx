'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFilters } from '@/hooks/useFilters';
import { LLMS, PROMPT_STRATEGIES, TEST_TYPES, COMPLEXITIES } from '@/config/constants';
import type { LLMType, PromptType, TestType, Complexity } from '@/types/metrics';

export function FilterPanel() {
  const {
    llm,
    promptStrategy,
    complexity,
    testType,
    setLLM,
    setPromptStrategy,
    setComplexity,
    setTestType,
    clearFilters,
    hasActiveFilters,
  } = useFilters();

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LLM Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">LLM Model</label>
            <Select
              value={llm || '__all__'}
              onValueChange={(value) => setLLM(value === '__all__' ? null : value as LLMType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All LLMs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All LLMs</SelectItem>
                {LLMS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Strategy Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Strategy</label>
            <Select
              value={promptStrategy || '__all__'}
              onValueChange={(value) => setPromptStrategy(value === '__all__' ? null : value as PromptType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Strategies</SelectItem>
                {PROMPT_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complexity Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Complexity</label>
            <Select
              value={complexity || '__all__'}
              onValueChange={(value) => setComplexity(value === '__all__' ? null : value as Complexity)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Complexities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Complexities</SelectItem>
                {COMPLEXITIES.map((comp) => (
                  <SelectItem key={comp.value} value={comp.value}>
                    {comp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Type</label>
            <Select
              value={testType || '__all__'}
              onValueChange={(value) => setTestType(value === '__all__' ? null : value as TestType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Test Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Test Types</SelectItem>
                {TEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {llm && (
              <Badge variant="secondary" className="gap-1">
                LLM: {LLMS.find((m) => m.value === llm)?.label}
                <button
                  onClick={() => setLLM(null)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {promptStrategy && (
              <Badge variant="secondary" className="gap-1">
                Strategy: {PROMPT_STRATEGIES.find((s) => s.value === promptStrategy)?.label}
                <button
                  onClick={() => setPromptStrategy(null)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {complexity && (
              <Badge variant="secondary" className="gap-1">
                Complexity: {COMPLEXITIES.find((c) => c.value === complexity)?.label}
                <button
                  onClick={() => setComplexity(null)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {testType && (
              <Badge variant="secondary" className="gap-1">
                Type: {TEST_TYPES.find((t) => t.value === testType)?.label}
                <button
                  onClick={() => setTestType(null)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
