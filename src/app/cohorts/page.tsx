'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { CohortHeatmap } from '@/components/cohorts/CohortHeatmap';
import { Grid3X3, ArrowUpRight, TrendingUp, Users, Target } from 'lucide-react';

export default function CohortsPage() {
  const { cohortMatrix } = useData();

  // Calculate average M1 retention
  const m1Values = cohortMatrix
    .map((r) => r.cells.find((c) => c.monthNumber === 1)?.retentionRate)
    .filter((v): v is number => v !== undefined && v > 0);

  const avgM1Retention =
    m1Values.length > 0
      ? Number((m1Values.reduce((a, b) => a + b, 0) / m1Values.length).toFixed(1))
      : 0;

  // Calculate average M3 retention
  const m3Values = cohortMatrix
    .map((r) => r.cells.find((c) => c.monthNumber === 3)?.retentionRate)
    .filter((v): v is number => v !== undefined && v > 0);

  const avgM3Retention =
    m3Values.length > 0
      ? Number((m3Values.reduce((a, b) => a + b, 0) / m3Values.length).toFixed(1))
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Análise de Retenção por Coortes
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Lifecycle Analytics
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Rastreamento mês a mês da fidelidade de cada safra de novos clientes desde o primeiro pedido (Mês 0) até 12 meses de atividade.
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
            <div className="text-[11px] text-zinc-400">Retenção M+1 Média</div>
            <div className="text-base font-bold font-mono text-emerald-400">{avgM1Retention}%</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
            <div className="text-[11px] text-zinc-400">Retenção M+3 Média</div>
            <div className="text-base font-bold font-mono text-teal-300">{avgM3Retention}%</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <CohortHeatmap data={cohortMatrix} />

      {/* Actionable Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <Target className="w-4 h-4" />
            <span>Momento Crítico: Mês +1</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            A maior queda de retenção ocorre entre o Mês 0 e o Mês 1. Campanhas de boas-vindas com cupom pós-primeira entrega aumentam a taxa em até 35%.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
            <Users className="w-4 h-4" />
            <span>Estabilização da Curva (M+3)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Clientes que continuam comprando no Mês +3 têm 4x mais chances de se tornarem <strong>Champions</strong> de alto LTV nos meses subsequentes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Efeito Safra (Seasonality)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Safras adquiridas durante a Black Friday costumam ter maior volume inicial (M0), mas requerem réguas especiais de retenção para evitar churn alto em janeiro.
          </p>
        </div>
      </div>
    </div>
  );
}
