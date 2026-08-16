'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { RfmCustomer } from '@/types/analytics';
import { Code2, Sparkles } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface RfmScatterPlotProps {
  customers: RfmCustomer[];
}

export function RfmScatterPlot({ customers }: RfmScatterPlotProps) {
  const { openSqlInspector } = useData();

  // Sample maximum 400 points for smooth canvas rendering
  const sampledCustomers = React.useMemo(() => {
    if (customers.length <= 400) return customers;
    const step = Math.ceil(customers.length / 400);
    return customers.filter((_, idx) => idx % step === 0);
  }, [customers]);

  const SEGMENT_COLORS: Record<string, string> = {
    Champions: '#10b981',
    'Loyal Customers': '#3b82f6',
    'Potential Loyalists': '#06b6d4',
    'New Promising Customers': '#8b5cf6',
    'At Risk / Churn Alert': '#f59e0b',
    'Hibernating / Cold': '#f97316',
    'Lost / Low Value': '#64748b',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: RfmCustomer = payload[0].payload;
      const color = SEGMENT_COLORS[data.segment] || '#10b981';

      return (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-zinc-100 border-b border-zinc-800 pb-1 flex items-center justify-between">
            <span>{data.customer_name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {data.segment}
            </span>
          </div>
          <div className="text-zinc-300 flex justify-between">
            <span>Recência:</span>
            <strong className="text-zinc-100 font-mono">{data.recency_days} dias</strong>
          </div>
          <div className="text-zinc-300 flex justify-between">
            <span>Frequência:</span>
            <strong className="text-zinc-100 font-mono">{data.frequency} pedidos</strong>
          </div>
          <div className="text-zinc-300 flex justify-between">
            <span>Gasto Total:</span>
            <strong className="text-emerald-400 font-mono">
              R$ {data.monetary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div className="text-zinc-400 text-[10px] pt-1 border-t border-zinc-800 flex justify-between">
            <span>Score RFM:</span>
            <span className="font-mono text-zinc-200">{data.rfm_score_combined} (R:{data.r_score} F:{data.f_score} M:{data.m_score})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">
              Dispersão de Clusters RFM (Recência vs. Valor Gasto)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Estatístico
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cada ponto representa um cliente. Eixo X = Dias sem comprar (Recência), Eixo Y = Faturamento acumulado (LTV).
          </p>
        </div>

        <button
          onClick={() => openSqlInspector('rfm_segmentation')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-zinc-300 hover:text-emerald-400 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition font-mono"
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Inspect SQL do RFM</span>
        </button>
      </div>

      {/* Scatter Chart */}
      <div className="h-80 w-full">
        {sampledCustomers.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                type="number"
                dataKey="recency_days"
                name="Recência (Dias)"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                unit=" dias"
                label={{
                  value: 'Dias desde a última compra (Menor = Mais Recente)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#71717a',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="monetary"
                name="Valor Total"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `R$${v}`}
                width={70}
              />
              <ZAxis range={[30, 90]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Clientes"
                data={sampledCustomers}
                fill="#10b981"
                opacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            Nenhum cliente disponível para dispersão.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800/80 text-xs">
        {Object.entries(SEGMENT_COLORS).map(([seg, color]) => (
          <div key={seg} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-zinc-300 font-medium text-[11px]">{seg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
