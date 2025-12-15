import type { CombinedMetrics, AggregatedByComplexity, AggregatedByPrompt, AggregatedByTestType } from '@/types/metrics';

export interface Insight {
  id: string;
  type: 'ranking' | 'trend' | 'warning' | 'recommendation';
  icon: string;
  title: string;
  message: string;
  severity?: 'high' | 'medium' | 'low';
}

export interface InsightsData {
  llmMetrics: CombinedMetrics[];
  complexityMetrics: AggregatedByComplexity[];
  promptMetrics: AggregatedByPrompt[];
  testTypeMetrics: AggregatedByTestType[];
  viewMode: 'test-set' | 'test-case';
}

/**
 * Generate insights from dashboard data
 */
export function generateInsights(data: InsightsData): Insight[] {
  const insights: Insight[] = [];

  // 1. Model Rankings Insight
  if (data.llmMetrics.length >= 2) {
    // Use different metrics based on view mode
    const metric = data.viewMode === 'test-set' ? 'svr_percentage' : 'fc_percentage';
    const metricName = data.viewMode === 'test-set' ? 'SVR' : 'FC';

    const topModel = data.llmMetrics.reduce((prev, current) =>
      current[metric] > prev[metric] ? current : prev
    );
    const filteredModels = data.llmMetrics.filter(m => m.llm !== topModel.llm);

    if (filteredModels.length > 0) {
      const secondModel = filteredModels.reduce((prev, current) =>
        current[metric] > prev[metric] ? current : prev
      );

      const diff = topModel[metric] - secondModel[metric];
      insights.push({
        id: 'model-ranking',
        type: 'ranking',
        icon: '🏆',
        title: 'Top Performing Model',
        message: `${topModel.llm} achieves highest ${metricName} (${topModel[metric].toFixed(2)}%), outperforming ${secondModel.llm} by ${diff.toFixed(2)} percentage points`,
      });
    }
  }

  // 2. Complexity Impact (if complexity data available)
  if (data.complexityMetrics.length >= 2) {
    const easyMetrics = data.complexityMetrics.find(m => m.complexity === 'Easy');
    const hardMetrics = data.complexityMetrics.find(m => m.complexity === 'Hard');

    if (easyMetrics && hardMetrics) {
      const metric = data.viewMode === 'test-set' ? 'csr_percentage' : 'fc_percentage';
      const metricName = data.viewMode === 'test-set' ? 'CSR' : 'FC';
      const drop = easyMetrics[metric] - hardMetrics[metric];
      const dropPct = Math.abs(drop);

      insights.push({
        id: 'complexity-impact',
        type: 'trend',
        icon: '📊',
        title: 'Complexity Impact',
        message: `Performance degrades significantly on Hard problems: ${metricName} drops by ${dropPct.toFixed(1)}% compared to Easy problems`,
        severity: dropPct > 20 ? 'high' : dropPct > 10 ? 'medium' : 'low',
      });
    }
  }

  // 3. Coverage-FC Paradox (only in test-case view)
  if (data.viewMode === 'test-case' && data.llmMetrics.length > 0) {
    const avgCoverage = data.llmMetrics.reduce((sum, m) => sum + m.avg_line_coverage, 0) / data.llmMetrics.length;
    const avgFC = data.llmMetrics.reduce((sum, m) => sum + m.fc_percentage, 0) / data.llmMetrics.length;
    const gap = avgCoverage - avgFC;

    if (gap > 30) {
      insights.push({
        id: 'coverage-fc-gap',
        type: 'warning',
        icon: '⚠️',
        title: 'Coverage vs Quality Gap',
        message: `Despite ${avgCoverage.toFixed(1)}% average coverage, only ${avgFC.toFixed(1)}% of test cases are functionally correct - high coverage doesn't guarantee test quality!`,
        severity: 'high',
      });
    }
  }

  // 4. Prompt Strategy Effectiveness
  if (data.promptMetrics.length >= 2) {
    // Use different metrics based on view mode
    const metric = data.viewMode === 'test-set' ? 'svr_percentage' : 'fc_percentage';
    const metricName = data.viewMode === 'test-set' ? 'SVR' : 'FC';

    const sorted = [...data.promptMetrics].sort((a, b) =>
      b[metric] - a[metric]
    );
    const bestPrompt = sorted[0];
    const worstPrompt = sorted[sorted.length - 1];

    if (bestPrompt && worstPrompt && bestPrompt.prompt_type !== worstPrompt.prompt_type) {
      const diff = bestPrompt[metric] - worstPrompt[metric];
      const bestName = formatPromptName(bestPrompt.prompt_type);
      const worstName = formatPromptName(worstPrompt.prompt_type);

      insights.push({
        id: 'prompt-strategy',
        type: 'recommendation',
        icon: '💡',
        title: 'Prompt Strategy Impact',
        message: `${bestName} prompting improves ${metricName} by ${diff.toFixed(1)}% over ${worstName}`,
        severity: diff > 5 ? 'high' : 'medium',
      });
    }
  }

  // 5. Test Type Difficulty
  if (data.testTypeMetrics.length >= 2) {
    // Use different metrics based on view mode
    const metric = data.viewMode === 'test-set' ? 'svr_percentage' : 'fc_percentage';

    const sorted = [...data.testTypeMetrics].sort((a, b) =>
      b[metric] - a[metric]
    );
    const easiestType = sorted[0];
    const hardestType = sorted[sorted.length - 1];

    if (easiestType && hardestType && easiestType.test_type !== hardestType.test_type) {
      const diff = easiestType[metric] - hardestType[metric];
      const easiestName = formatTestTypeName(easiestType.test_type);
      const hardestName = formatTestTypeName(hardestType.test_type);

      insights.push({
        id: 'test-type-difficulty',
        type: 'trend',
        icon: '📉',
        title: 'Test Type Difficulty',
        message: `${hardestName} tests show ${diff.toFixed(1)}% lower success rate than ${easiestName} tests`,
        severity: diff > 15 ? 'high' : diff > 10 ? 'medium' : 'low',
      });
    }
  }

  // 6. Best Configuration (if all data available)
  if (data.llmMetrics.length > 0 && data.promptMetrics.length > 0 && data.testTypeMetrics.length > 0) {
    // Use different metrics based on view mode
    const metric = data.viewMode === 'test-set' ? 'svr_percentage' : 'fc_percentage';

    const bestLLM = data.llmMetrics.reduce((prev, current) =>
      current[metric] > prev[metric] ? current : prev
    );
    const bestPrompt = data.promptMetrics.reduce((prev, current) =>
      current[metric] > prev[metric] ? current : prev
    );
    const bestTestType = data.testTypeMetrics.reduce((prev, current) =>
      current[metric] > prev[metric] ? current : prev
    );

    insights.push({
      id: 'best-config',
      type: 'recommendation',
      icon: '✨',
      title: 'Optimal Configuration',
      message: `Best combination: ${bestLLM.llm} + ${formatPromptName(bestPrompt.prompt_type)} + ${formatTestTypeName(bestTestType.test_type)} tests`,
    });
  }

  return insights;
}

/**
 * Format prompt type for display
 */
function formatPromptName(promptType: string): string {
  const map: Record<string, string> = {
    'zero_shot': 'Zero-Shot',
    'few_shot': 'Few-Shot',
    'chain_of_thought': 'Chain-of-Thought',
  };
  return map[promptType] || promptType;
}

/**
 * Format test type for display
 */
function formatTestTypeName(testType: string): string {
  const map: Record<string, string> = {
    'standard': 'Standard',
    'boundary': 'Boundary',
    'mix': 'Mixed',
  };
  return map[testType] || testType;
}
