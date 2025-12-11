# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 dashboard for comparing LLM test generation performance across different models (Llama, Qwen), prompt strategies, and test configurations. Pre-aggregated CSV data is loaded dynamically based on active filters to minimize data transfer.

## Commands

```bash
npm run dev          # Dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
```

## Architecture

### Data Flow

Dynamic aggregation system loads CSV files based on active filters:

1. User selects filters → Zustand store updates
2. `determineAggregationLevel()` selects appropriate CSV:
   - No filters → `tsm_llm.csv` (LLM only)
   - With prompt → `tsm_llm_prompt.csv` (LLM × Prompt)
   - Prompt + test type → `tsm_llm_prompt_test.csv`
   - All filters → `tsm_full_config.csv`
3. API route `/api/test-set-metrics/[aggregation]` loads CSV via Papa Parse
4. Client-side filtering refines loaded data
5. Recharts + TanStack Table render results

### Key Files

```
src/
├── app/
│   ├── api/test-set-metrics/[aggregation]/route.ts   # CSV loader API
│   ├── api/test-case-metrics/[aggregation]/route.ts
│   └── page.tsx                                       # Main dashboard
├── components/
│   ├── charts/                   # Recharts
│   ├── tables/                   # TanStack Table
│   ├── filters/                  # Filter UI
│   └── ui/                       # Shadcn components
├── data/
│   ├── Test set metrics/         # 6 pre-aggregated CSVs (tsm_*.csv)
│   └── Test case metrics/        # 6 pre-aggregated CSVs (tcm_*.csv)
├── hooks/useFilters.ts           # Zustand store (localStorage persisted)
├── lib/data/
│   ├── load-csv.ts               # Papa Parse + normalization
│   └── filter-data.ts            # Aggregation level logic
├── config/constants.ts           # LLM/prompt/test configs, colors
└── types/metrics.ts              # Union types for 6 aggregation levels
```

### Important Patterns

**Type System**: 6 aggregation levels = 6 union type variants in `types/metrics.ts`. Each CSV shape (llm only, llm+prompt, llm+prompt+test, etc.) has a corresponding TypeScript interface.

**CSV Normalization**: Source CSVs have inconsistent casing (Title-Case vs snake_case, "Mixed" vs "mix"). `normalizeMetricsRow()` in `load-csv.ts` standardizes to snake_case/lowercase on load.

**Caching**: API routes use `force-static` + 1hr revalidation. Filter changes in Zustand trigger re-fetch via `useEffect` deps in `page.tsx`.

### Metrics

**Test Set** (suite-level success rates):
- CSR: Compile Success Rate
- RSR: Runtime Success Rate (≥80% of submissions ran)
- SVR: Semantic Validity Rate

**Test Case** (individual test quality):
- FC: Functional Correctness (passes ≥80% of submissions)
- Coverage: Avg line coverage for top 16 correct tests

## Tech Stack

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS 4.0 + `cn()` utility for class merging
- Zustand (global filter state, localStorage persisted)
- Recharts + TanStack Table
- Papa Parse for CSV
- Zod for validation
- Path alias: `@/*` → `src/*`

## Modifying Data Structure

To add aggregation levels or change CSV format:

1. Update union types in `types/metrics.ts`
2. Add Zod schemas in `lib/validations/`
3. Update `determineAggregationLevel()` in `lib/data/filter-data.ts`
4. Handle new format in `normalizeMetricsRow()` (`load-csv.ts`)
5. Add new LLMs/prompts/test types to `config/constants.ts`

## Gotchas

- Next.js 15 requires `await params` in route handlers (async params)
- CSV files in `src/data/` are server-side only (loaded via API routes)
- Zustand filter changes trigger full API re-fetch (not incremental)

## Development Approach

Follow senior developer practices when implementing features or fixing issues:

**Before coding:**
- Read existing code first - understand patterns before changing them
- Check similar components/functions for established conventions
- Verify assumptions by reading type definitions and actual data

**When implementing:**
- Match existing patterns - don't introduce new paradigms without reason
- Keep changes minimal - fix what's broken, don't refactor unrelated code
- Use existing utilities - check `lib/`, `config/`, `hooks/` before writing new helpers
- Test with actual data - inspect CSV files and API responses

**When debugging:**
- Check browser console + Network tab first (client-side data issues are common)
- Verify CSV normalization if seeing type/filter mismatches
- Look at Zustand devtools for filter state issues
- API routes log to terminal - check server logs for CSV parse errors

**Code quality:**
- No over-engineering - three similar lines beats premature abstraction
- No defensive coding - trust TypeScript, validate at boundaries only (API routes, CSV parse)
- Existing code style trumps personal preference
- Comments explain "why", not "what" - only when logic isn't obvious
