'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { ForecastSummary } from '@/types/analytics';
import { Code2, TrendingUp, Sparkles, Activity, Sigma } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface ForecastChartProps {
  forecast: ForecastSummary;
}

export function ForecastChart({ forecast }: ForecastChartProps) {
  const { openSqlInspector } = useData();

  // Combine historical and projected data for continuous visualization
  const combinedData = React.useMemo(() => {
    const hist = forecast.historicalData.map((d) => ({
      date: d.date,
      historicalGmv: d.actualGmv,
      movingAverage7d: d.movingAverage7d,
      projectedGmv: null,
      lowerBound: null,
      upperBound: null,
    }));

    // Connect the last historical point with the start of the projection
    const lastHist = forecast.historicalData[forecast.historicalData.length - 1];

    const proj = forecast.projectedData.map((d, index) => ({
      date: d.date,
      historicalGmv: null,
      movingAverage7d: null,
      projectedGmv: d.forecastGmv,
      lowerBound: d.lowerBound,
      upperBound: d.upperBound,
    }));

    return [...hist, ...proj];
  }, [forecast]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
    return `R$ ${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const histVal = payload.find((p: any) => p.dataKey === 'historicalGmv')?.value;
      const projVal = payload.find((p: any) => p.dataKey === 'projectedGmv')?.value;
      const movAvg = payload.find((p: any) => p.dataKey === 'movingAverage7d')?.value;
      const lower = payload.find((p: any) => p.dataKey === 'lowerBound')?.value;
      const upper = payload.find((p: any) => p.dataKey === 'upperBound')?.value;

      return (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-zinc-100 border-b border-zinc-800 pb-1 flex items-center justify-between">
            <span>Data: {label}</span>
            {projVal !== null && projVal !== undefined ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-medium">
                Projeção Futura
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-medium">
                Histórico Real
              </span>
            )}
          </div>

          {histVal !== null && histVal !== undefined && (
            <div className="flex justify-between">
              <span className="text-zinc-300">Receita Real:</span>
              <strong className="text-emerald-400 font-mono">
                R$ {histVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          )}

          {movAvg !== null && movAvg !== undefined && (
            <div className="flex justify-between text-zinc-400">
              <span>Média Móvel (7d):</span>
              <span className="font-mono text-zinc-200">
                R$ {movAvg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {projVal !== null && projVal !== undefined && (
            <>
              <div className="flex justify-between">
                <span className="text-zinc-300">Previsão Esperada:</span>
                <strong className="text-cyan-400 font-mono">
                  R$ {projVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              {lower !== undefined && upper !== undefined && (
                <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 flex justify-between">
                  <span>Margem (95% Conf.):</span>
                  <span className="font-mono text-zinc-300">
                    R${lower} ~ R${upper}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100">
              Projeção de Faturamento & Tendência Linear
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              Forecasting
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Regressão linear ordinária (OLS) sobre a série diária + projeção ajustada para os próximos 30 dias.
          </p>
        </div>

        <button
          onClick={() => openSqlInspector('revenue_forecasting')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-zinc-300 hover:text-emerald-400 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition font-mono"
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>Inspect SQL do Forecast</span>
        </button>
      </div>

      {/* Regression Statistical Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="text-[11px] text-zinc-400">Receita Prevista (30d)</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
            R$ {forecast.expectedNext30dRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {forecast.growthRateExpectedPercent >= 0 ? '+' : ''}
            {forecast.growthRateExpectedPercent}% vs últimos 30d
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="text-[11px] text-zinc-400">Coeficiente Angular (Slope m)</div>
          <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
            {forecast.slope >= 0 ? `+${forecast.slope}` : forecast.slope}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Variação diária de GMV</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="text-[11px] text-zinc-400">R² (Ajuste da Reta)</div>
          <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
            {forecast.rSquared}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Qualidade do ajuste estatístico</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="text-[11px] text-zinc-400">Fórmula da Tendência</div>
          <div className="text-xs font-mono font-semibold text-emerald-400 mt-1 truncate">
            ŷ = {forecast.slope}x + {forecast.intercept}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Equação da Reta OLS</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-80 w-full">
        {combinedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical Line */}
              <Line
                type="monotone"
                dataKey="historicalGmv"
                name="Receita Real"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />

              {/* 7-Day Moving Average */}
              <Line
                type="monotone"
                dataKey="movingAverage7d"
                name="Média Móvel 7d"
                stroke="#6ee7b7"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Future Projected Line */}
              <Line
                type="monotone"
                dataKey="projectedGmv"
                name="Previsão 30d"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500">
            Nenhum dado para projeção.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-emerald-500 rounded" />
          <span>Receita Histórica Real</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-emerald-300 border-b border-dashed border-emerald-300" />
          <span>Média Móvel (7 Dias)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-cyan-400 border-b-2 border-dashed border-cyan-400" />
          <span className="text-cyan-300 font-medium">Projeção Futura (30 Dias)</span>
        </div>
      </div>
    </div>
  );
}
