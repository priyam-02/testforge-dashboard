'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TestSetMetrics } from '@/types/metrics';

interface TestSetMetricsTableProps {
  data: TestSetMetrics[];
}

export function TestSetMetricsTable({ data }: TestSetMetricsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<TestSetMetrics>[] = [
    {
      accessorKey: 'llm',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            LLM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    ...(data.length > 0 && 'prompt_type' in data[0]
      ? [
          {
            accessorKey: 'prompt_type',
            header: 'Prompt Strategy',
          } as ColumnDef<TestSetMetrics>,
        ]
      : []),
    ...(data.length > 0 && 'test_type' in data[0]
      ? [
          {
            accessorKey: 'test_type',
            header: 'Test Type',
          } as ColumnDef<TestSetMetrics>,
        ]
      : []),
    ...(data.length > 0 && 'complexity' in data[0]
      ? [
          {
            accessorKey: 'complexity',
            header: 'Complexity',
          } as ColumnDef<TestSetMetrics>,
        ]
      : []),
    {
      accessorKey: 'total_expected',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Expected
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.total_expected.toLocaleString(),
    },
    {
      accessorKey: 'compiled',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Compiled
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.compiled.toLocaleString(),
    },
    {
      accessorKey: 'csr_percentage',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            CSR %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => `${row.original.csr_percentage.toFixed(2)}%`,
    },
    {
      accessorKey: 'runtime_success',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Runtime Success
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.runtime_success.toLocaleString(),
    },
    {
      accessorKey: 'rsr_percentage',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            RSR %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => `${row.original.rsr_percentage.toFixed(2)}%`,
    },
    {
      accessorKey: 'semantically_valid',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Semantically Valid
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => row.original.semantically_valid.toLocaleString(),
    },
    {
      accessorKey: 'svr_percentage',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            SVR %
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => `${row.original.svr_percentage.toFixed(2)}%`,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Test Set Metrics Data</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left p-2 font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {table.getRowModel().rows.length} row(s)
      </div>
    </Card>
  );
}
