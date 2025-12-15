'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { generateInsights, type Insight, type InsightsData } from '@/lib/insights/generate-insights';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InsightsPanelProps {
  data: InsightsData;
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const insights = generateInsights(data);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Key Research Insights</h3>
          <p className="text-sm text-muted-foreground">
            Auto-generated findings from the data
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          aria-label={isExpanded ? 'Hide insights' : 'Show insights'}
        >
          {isExpanded ? (
            <>
              Hide <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </Card>
  );
}

interface InsightCardProps {
  insight: Insight;
}

function InsightCard({ insight }: InsightCardProps) {
  const typeColors = {
    ranking: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    trend: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    recommendation: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
  };

  const severityIndicator = insight.severity === 'high'
    ? 'border-l-4 border-l-red-500'
    : insight.severity === 'medium'
    ? 'border-l-4 border-l-yellow-500'
    : '';

  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all hover:shadow-md
        ${typeColors[insight.type]}
        ${severityIndicator}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {insight.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {insight.title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}
