'use client';

import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface MetricsExplanationProps {
  metricView: 'test-set' | 'test-case';
}

export function MetricsExplanation({ metricView }: MetricsExplanationProps) {
  const isTestSet = metricView === 'test-set';

  return (
    <Card className={`p-6 ${
      isTestSet
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800'
        : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800'
    } shadow-md`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${
            isTestSet ? 'bg-blue-500 dark:bg-blue-600' : 'bg-emerald-500 dark:bg-emerald-600'
          } flex items-center justify-center`}>
            <Info className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {isTestSet ? (
            <>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Test Set Metrics
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Measures whether generated test suites <strong>compile, run, and are semantically valid</strong>.
                Focuses on the overall quality of the generated test code.
              </p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-2">
                <div><strong>CSR:</strong> Compile Success Rate - Does the code compile?</div>
                <div><strong>RSR:</strong> Runtime Success Rate - Does it run without errors?</div>
                <div><strong>SVR:</strong> Semantic Validity Rate - Is it semantically correct?</div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                Test Case Metrics
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Evaluates how well tests <strong>verify correctness and achieve code coverage</strong>.
                Focuses on the effectiveness of the generated tests.
              </p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mt-2">
                <div><strong>FC%:</strong> Functional Correctness - Do tests catch bugs?</div>
                <div><strong>Coverage:</strong> Line Coverage - How much code is exercised?</div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
