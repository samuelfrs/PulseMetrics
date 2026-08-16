'use client';

import React, { useState } from 'react';
import { CohortRow } from '@/types/analytics';
import { Code2, Grid3X3, Info, Users } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface CohortHeatmapProps {
  data: CohortRow[];
}

export function CohortHeatmap({ data }: CohortHeatmapProps) {
  const { openSqlInspector } = useData();
  const [hoveredCell, setHoveredCell] = useState<{
    cohort: string;
    month: number;
    active: number;
    total: number;
    rate: number;
  } | null>(null);

  // Maximum months to display
  const maxMonthColumns = 12;

  // Background color interpolator for heatmap cells
  const getCellBackground = (rate: number, isMonthZero: boolean) => {
    if (isMonthZero) return 'bg-emerald-600/80 text-white font-bold';
    if (rate >= 40) return 'bg-emerald-500/70 text-white font-semibold';
    if (rate >= 25) return 'bg-emerald-600/40 text-emerald-100 font-medium';
    if (rate >= 15) return 'bg-teal-700/30 text-teal-200';
    if (rate >= 8) return 'bg-teal-900/30 text-teal-300';
    if (rate > 0) return 'bg-zinc-800/60 text-zinc-400';
    return 'bg-zinc-900/30 text-zinc-600';
  };

  // Compute average retention rate across all cohorts for each month index
  const averageRetentionPerMonth = Array.from({ length: maxMonthColumns }).map((_, mIdx) => {
    const validCells = data
      .map((row) => row.cells.find((c) => c.monthNumber === mIdx))
      .filter((cell): cell is NonNullable<typeof cell> => cell !== undefined && cell.activeCustomers > 0);

    if (validCells.length === 0) return mIdx === 0 ? 100 : 0;
    const avg = validCells.reduce((sum, c) => sum + c.retentionRate, 0) / validCells.length;
    return Number(avg.toFixed(1));
  });

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              Matriz de Retenção por Coortes (Cohort Analysis)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Heatmap
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Acompanhe o percentual de clientes que continuam recomprando ao longo dos meses após a 1ª compra.
          </p>
        </div>

        <button
          onClick={() => openSqlInspector('cohort_retention_matrix')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-zinc-300 hover:text-emerald-400 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition font-mono"
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Inspect SQL da Matriz</span>
        </button>
      </div>

      {/* Heatmap Table Container */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-3 px-3 w-28">Safra (Coorte)</th>
              <th className="py-3 px-3 w-24 text-center">Tamanho (M0)</th>
              {Array.from({ length: maxMonthColumns }).map((_, i) => (
                <th key={i} className="py-3 px-2 text-center font-mono">
                  M+{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.map((row) => (
              <tr key={row.cohortMonth} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 px-3 font-mono font-medium text-zinc-200 whitespace-nowrap">
                  {row.cohortMonth}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-200">
                    {row.cohortSize}
                  </span>
                </td>
                {Array.from({ length: maxMonthColumns }).map((_, mIndex) => {
                  const cell = row.cells.find((c) => c.monthNumber === mIndex);
                  const isM0 = mIndex === 0;
                  const rate = cell ? cell.retentionRate : 0;
                  const activeCount = cell ? cell.activeCustomers : 0;

                  return (
                    <td key={mIndex} className="p-1 text-center">
                      <div
                        onMouseEnter={() =>
                          setHoveredCell({
                            cohort: row.cohortMonth,
                            month: mIndex,
                            active: activeCount,
                            total: row.cohortSize,
                            rate,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-emerald-400 ${getCellBackground(
                          rate,
                          isM0
                        )}`}
                      >
                        {isM0 ? '100%' : rate > 0 ? `${rate}%` : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Average Row */}
          <tfoot>
            <tr className="border-t-2 border-zinc-700 bg-zinc-950/60 font-semibold text-zinc-300">
              <td className="py-3 px-3 font-medium">Média Geral</td>
              <td className="py-3 px-3 text-center font-mono text-zinc-400">
                {data.reduce((s, r) => s + r.cohortSize, 0)}
              </td>
              {averageRetentionPerMonth.map((avg, mIndex) => (
                <td key={mIndex} className="p-1 text-center font-mono text-emerald-400 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {avg > 0 ? `${avg}%` : '—'}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Hover Info Banner */}
      {hoveredCell && (
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-zinc-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              Safra <strong className="text-white">{hoveredCell.cohort}</strong> no Mês{' '}
              <strong className="text-emerald-400">+{hoveredCell.month}</strong>:
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-zinc-200">
            <span>
              Retenção: <strong className="text-emerald-400">{hoveredCell.rate}%</strong>
            </span>
            <span>
              Clientes Ativos: {hoveredCell.active} de {hoveredCell.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
