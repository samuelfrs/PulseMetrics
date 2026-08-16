'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyKpi } from '@/types/analytics';
import { Code2, TrendingUp } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface RevenueChartProps {
  data: MonthlyKpi[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { openSqlInspector } = useData();

  const formattedData = data.map((item) => ({
    month: item.order_month,
    gmv: item.gmv,
    orders: item.total_orders,
    ticket: item.average_order_value,
    growth: item.gmv_growth_percent,
  }));

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
    return `R$ ${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const gmvVal = payload[0].value;
      const currentItem = formattedData.find((d) => d.month === label);

      return (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl text-xs space-y-1.5">
          <div className="font-semibold text-zinc-200 border-b border-zinc-800 pb-1 flex items-center justify-between">
            <span>Mês: {label}</span>
            {currentItem?.growth !== null && currentItem?.growth !== undefined && (
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  currentItem.growth >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {currentItem.growth >= 0 ? `+${currentItem.growth}%` : `${currentItem.growth}%`} MoM
              </span>
            )}
          </div>
          <div className="text-emerald-400 font-mono font-bold text-sm">
            R$ {gmvVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-zinc-400 flex items-center justify-between gap-4">
            <span>Total de Pedidos:</span>
            <span className="text-zinc-200 font-mono">{currentItem?.orders}</span>
          </div>
          <div className="text-zinc-400 flex items-center justify-between gap-4">
            <span>Ticket Médio:</span>
            <span className="text-zinc-200 font-mono">
              R$ {currentItem?.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">
              Evolução Histórica de Faturamento (GMV)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Mensal
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Série temporal de receita com cálculo de crescimento MoM
          </p>
        </div>

        <button
          onClick={() => openSqlInspector('kpi_mom_growth')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition font-mono"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Inspect SQL</span>
        </button>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gmvGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            Nenhum dado encontrado para o período selecionado.
          </div>
        )}
      </div>
    </div>
  );
}
