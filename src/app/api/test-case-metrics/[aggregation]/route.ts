import { NextResponse } from 'next/server';
import { loadTestCaseMetrics, type TestCaseAggregation } from '@/lib/data/load-csv';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(
  request: Request,
  { params }: { params: Promise<{ aggregation: string }> }
) {
  try {
    const { aggregation: aggregationParam } = await params;
    const aggregation = aggregationParam as TestCaseAggregation;

    // Validate aggregation level
    const validAggregations: TestCaseAggregation[] = [
      'llm',
      'llm_prompt',
      'llm_test',
      'llm_prompt_comp',
      'llm_prompt_test',
      'full_config',
    ];

    if (!validAggregations.includes(aggregation)) {
      return NextResponse.json(
        { success: false, error: 'Invalid aggregation level' },
        { status: 400 }
      );
    }

    const data = await loadTestCaseMetrics(aggregation);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error loading test case metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load test case metrics' },
      { status: 500 }
    );
  }
}
