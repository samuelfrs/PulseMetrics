'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { ForecastChart } from '@/components/forecasting/ForecastChart';
import { TrendingUp, Sigma, BrainCircuit, BarChart3, HelpCircle } from 'lucide-react';

export default function ForecastingPage() {
  const { forecast } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Previsão de Receita & Regressão Linear
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
              Estatística Preditiva
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Ajuste de mínimos quadrados ordinários (OLS) sobre o histórico diário de faturamento com projeção para os próximos 30 dias e intervalos de confiança estatísticos.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
          <div className="text-[11px] text-zinc-400">Previsão Acumulada (30d)</div>
          <div className="text-lg font-bold font-mono text-cyan-400">
            R$ {forecast.expectedNext30dRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Forecast Chart with Badges */}
      <ForecastChart forecast={forecast} />

      {/* Educational & Statistical Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
            <Sigma className="w-4 h-4" />
            <span>Fórmula Matemática (OLS)</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/80 font-mono text-xs text-emerald-300 border border-zinc-800/80 space-y-1">
            <div>m = (N·Σxy - Σx·Σy) / (N·Σx² - (Σx)²)</div>
            <div>b = (Σy - m·Σx) / N</div>
            <div><strong>ŷ = {forecast.slope}x + {forecast.intercept}</strong></div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            O algoritmo minimiza a soma dos resíduos quadráticos entre o faturamento real e a reta de tendência projetada.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>Qualidade do Ajuste (R² = {forecast.rSquared})</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            O coeficiente de determinação <strong>R²</strong> mede a proporção da variabilidade da receita explicada pela tendência linear temporal.
          </p>
          <div className="text-xs text-zinc-400">
            Valores de R² próximos a 1 indicam forte previsibilidade linear, enquanto oscilações refletem sazonalidades naturais do varejo.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
            <BrainCircuit className="w-4 h-4" />
            <span>Ajuste Sazonal de Dias da Semana</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            O modelo pondera automaticamente compras em finais de semana vs dias úteis com multiplicadores históricos de conversão.
          </p>
          <div className="text-xs text-zinc-400">
            A margem de confiança expande gradualmente quanto mais distante no futuro for a data prevista.
          </div>
        </div>
      </div>
    </div>
  );
}
