'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { Code2, ShoppingBag } from 'lucide-react';

export function CategoryBreakdown() {
  const { categoryDistribution, openSqlInspector } = useData();

  const totalRevenue = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  const sortedCategories = [...categoryDistribution].sort((a, b) => b.value - a.value);

  const CATEGORY_COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#64748b', // Slate
  ];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-emerald-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              Receita por Categoria
            </h3>
            <p className="text-xs text-zinc-400">Participação no faturamento total</p>
          </div>
        </div>

        <button
          onClick={() => openSqlInspector('category_revenue')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition font-mono"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Inspect SQL</span>
        </button>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 my-2">
        {sortedCategories.slice(0, 6).map((cat, index) => {
          const share = totalRevenue > 0 ? (cat.value / totalRevenue) * 100 : 0;
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-zinc-200 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-zinc-400">{share.toFixed(1)}%</span>
                  <span className="text-zinc-100 font-semibold">
                    R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(2, share)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Total de Categorias Mapeadas: {sortedCategories.length}</span>
        <span className="font-mono text-emerald-400">
          R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
