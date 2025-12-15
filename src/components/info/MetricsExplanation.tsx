'use client';

import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface MetricsExplanationProps {
  metricView: 'test-set' | 'test-case';
}

export function MetricsExplanation({ metricView }: MetricsExplanationProps) {
  const isTestSet = metricView === 'test-set';

  return (
    <Card className={`p-6 border-2 ${
      isTestSet ? 'border-[#40A9FF]' : 'border-[#36CFC9]'
    }`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-full ${
            isTestSet ? 'bg-[#40A9FF]' : 'bg-[#36CFC9]'
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
