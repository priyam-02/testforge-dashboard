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
    low: 'bg-[#101421] border-[#36CFC9] text-[#36CFC9]',
    medium: 'bg-[#101421] border-[#FAAD14] text-[#FAAD14]',
    high: 'bg-[#101421] border-[#FF4D4F] text-[#FF4D4F]',
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
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <Info className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold font-mono flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {Math.abs(card.value).toFixed(2)}{card.suffix}
              </p>
            </div>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">
            {degradation.severity === 'high' && 'Significant degradation'}
            {degradation.severity === 'medium' && 'Moderate degradation'}
            {degradation.severity === 'low' && 'Minor degradation'}
          </p>
          {/* Tooltip appears on hover */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-full max-w-xs z-10">
            <div className="bg-[#181D2B] text-foreground text-xs rounded-lg p-3 border border-border">
              {card.tooltip}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
