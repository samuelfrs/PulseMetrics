'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Code2, LucideIcon } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  changePercent?: number | null;
  changePeriod?: string;
  icon: LucideIcon;
  queryId?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  changePercent,
  changePeriod = 'vs mês anterior',
  icon: Icon,
  queryId = 'kpi_mom_growth',
}: KpiCardProps) {
  const { openSqlInspector } = useData();

  const isPositive = changePercent !== undefined && changePercent !== null && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent !== null && changePercent < 0;
  const isNeutral = changePercent === 0 || changePercent === null || changePercent === undefined;

  return (
    <div className="relative group bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-200 shadow-sm flex flex-col justify-between">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {title}
            </h4>
            {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
          </div>
        </div>

        {/* Inspect SQL Button */}
        <button
          onClick={() => openSqlInspector(queryId)}
          title="Ver Query SQL desta métrica"
          className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition text-xs flex items-center gap-1 font-mono"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">SQL</span>
        </button>
      </div>

      {/* Main value */}
      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
      </div>

      {/* Bottom Growth indicator */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        {changePercent !== undefined && changePercent !== null ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isNegative
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              {isPositive ? `+${changePercent}%` : `${changePercent}%`}
            </span>
            <span className="text-zinc-400 text-[11px]">{changePeriod}</span>
          </div>
        ) : (
          <span className="text-zinc-400 text-[11px]">Série histórica consolidada</span>
        )}
      </div>
    </div>
  );
}
