'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { kpis, isLoading } = useData();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Painel Executivo de Receita & Métricas
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Acompanhamento em tempo real de GMV, ticket médio, aceleração MoM e comportamento transacional com consultas analíticas inspecionáveis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <span>Ver Pedidos (1:N)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/cohorts"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <span>Ver Coortes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/segmentation"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition shadow-lg shadow-emerald-600/20"
          >
            <span>Explorar RFM</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Faturamento Total (GMV)"
          value={`R$ ${kpis.totalGmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Volume financeiro transacionado"
          changePercent={kpis.momGmvGrowth}
          icon={DollarSign}
          queryId="kpi_mom_growth"
        />

        <KpiCard
          title="Total de Pedidos"
          value={kpis.totalOrders.toLocaleString('pt-BR')}
          subtitle="Transações concluídas"
          changePercent={kpis.momOrdersGrowth}
          icon={ShoppingCart}
          queryId="kpi_mom_growth"
        />

        <KpiCard
          title="Ticket Médio"
          value={`R$ ${kpis.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Valor médio gasto por pedido"
          changePercent={kpis.momGmvGrowth && kpis.momOrdersGrowth ? Number((kpis.momGmvGrowth - kpis.momOrdersGrowth).toFixed(1)) : null}
          icon={TrendingUp}
          queryId="kpi_mom_growth"
        />

        <KpiCard
          title="Taxa de Recompra"
          value={`${kpis.repurchaseRate}%`}
          subtitle={`${kpis.activeCustomers.toLocaleString('pt-BR')} clientes na base`}
          icon={Repeat}
          queryId="cohort_retention_matrix"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={kpis.monthlyHistory} />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdown />
        </div>
      </div>

      {/* Highlights & Methodology Footer Banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-zinc-200">Arquitetura Verificada:</span> Todas as métricas acima são calculadas com Window Functions (`LAG`, `OVER`) e CTEs compatíveis com PostgreSQL 17 / Supabase.
          </div>
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          PulseMetrics Analytics v1.0
        </div>
      </div>
    </div>
  );
}
