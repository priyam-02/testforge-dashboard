'use client';

import { Card } from '@/components/ui/card';
import type { DegradationMetrics } from '@/types/metrics';
import { TrendingDown, Info } from 'lucide-react';

interface DegradationCardsProps {
  degradation: DegradationMetrics;
  viewMode: 'test-set' | 'test-case';
}

export function DegradationCards({ degradation, viewMode }: DegradationCardsProps) {
  const severityColors = {
    low: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    high: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  };

  const cards = viewMode === 'test-set'
    ? [
        {
          label: 'CSR Drop (Easy→Hard)',
          value: degradation.csrDrop,
          suffix: '%',
          tooltip: 'Compile Success Rate: Performance drop from Easy to Hard complexity problems'
        },
        {
          label: 'RSR Drop (Easy→Hard)',
          value: degradation.rsrDrop,
          suffix: '%',
          tooltip: 'Runtime Success Rate: Performance drop from Easy to Hard complexity problems'
        },
        {
          label: 'SVR Drop (Easy→Hard)',
          value: degradation.svrDrop,
          suffix: '%',
          tooltip: 'Semantic Validity Rate: Performance drop from Easy to Hard complexity problems'
        },
      ]
    : [
        {
          label: 'FC% Drop (Easy→Hard)',
          value: degradation.fcDrop,
          suffix: '%',
          tooltip: 'Functional Correctness: Test pass rate drop from Easy to Hard complexity problems'
        },
        {
          label: 'Coverage Drop (Easy→Hard)',
          value: degradation.coverageDrop,
          suffix: '%',
          tooltip: 'Line Coverage: Code coverage drop from Easy to Hard complexity problems'
        },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`p-4 border-2 ${severityColors[degradation.severity]} group relative`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{card.label}</p>
                <Info className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {Math.abs(card.value).toFixed(2)}{card.suffix}
              </p>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-75">
            {degradation.severity === 'high' && 'Significant degradation'}
            {degradation.severity === 'medium' && 'Moderate degradation'}
            {degradation.severity === 'low' && 'Minor degradation'}
          </p>
          {/* Tooltip appears on hover */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-full max-w-xs z-10">
            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
              {card.tooltip}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
