'use client';

import { Card } from '@/components/ui/card';
import { Info, ArrowRight } from 'lucide-react';
import type { SummaryMetrics } from '@/types/metrics';

interface MetricsExplanationProps {
  metricView: 'test-set' | 'test-case' | 'outcomes';
  summaryMetrics?: SummaryMetrics;
}

export function MetricsExplanation({ metricView, summaryMetrics }: MetricsExplanationProps) {
  const isTestSet = metricView === 'test-set';
  const isOutcomes = metricView === 'outcomes';

  return (
    <Card className={`p-6 border-2 ${
      isTestSet ? 'border-[#40A9FF]' :
      isOutcomes ? 'border-[#36CFC9]' :
      'border-[#36CFC9]'
    }`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-full ${
            isTestSet ? 'bg-[#40A9FF]' :
            isOutcomes ? 'bg-[#36CFC9]' :
            'bg-[#36CFC9]'
          } flex items-center justify-center`}>
            <Info className="w-5 h-5 text-[#050711]" />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {isTestSet ? (
            <>
              <h3 className="text-lg font-bold text-foreground">
                Test Set Metrics
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Measures whether generated test suites <strong className="text-foreground">compile, run, and are semantically valid</strong>.
                Focuses on the overall quality of the generated test code.
              </p>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <div><strong className="text-[#FF4D4F]">CSR:</strong> Compile Success Rate - Does the code compile?</div>
                <div><strong className="text-[#FAAD14]">RSR:</strong> Runtime Success Rate - Does it run without errors?</div>
                <div><strong className="text-[#9254DE]">SVR:</strong> Semantic Validity Rate - Is it semantically correct?</div>
              </div>
            </>
          ) : isOutcomes ? (
            <>
              <h3 className="text-lg font-bold text-foreground">
                Outcome Metrics (O1-O4)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Classification of generated test suites based on compilation, execution, and semantic validity.
              </p>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <div><strong className="text-[#FF4D4F]">O1:</strong> Fails to compile - Cannot be executed</div>
                <div><strong className="text-[#FAAD14]">O2:</strong> Runtime failure - Compiles but crashes during execution</div>
                <div><strong className="text-[#9254DE]">O3:</strong> Semantically invalid - Runs but produces incorrect results</div>
                <div><strong className="text-[#36CFC9]">O4:</strong> Valid suite - Compiles, runs, and is semantically correct</div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground">
                Test Case Metrics
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Evaluates how well tests <strong className="text-foreground">verify correctness and achieve code coverage</strong>.
                Focuses on the effectiveness of the generated tests.
              </p>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <div><strong className="text-[#36CFC9]">FC%:</strong> Functional Correctness - Do tests catch bugs?</div>
                <div><strong className="text-[#73D13D]">Coverage:</strong> Line Coverage - How much code is exercised?</div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
