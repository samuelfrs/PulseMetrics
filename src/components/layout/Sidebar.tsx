'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  TrendingUp,
  UploadCloud,
  Activity,
  Database,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export const NAV_ITEMS = [
  {
    href: '/',
    label: 'Visão Geral',
    icon: LayoutDashboard,
    badge: 'KPIs',
  },
  {
    href: '/orders',
    label: 'Transações & Pedidos',
    icon: ShoppingBag,
    badge: '1:N',
  },
  {
    href: '/cohorts',
    label: 'Matriz de Coortes',
    icon: Grid3X3,
    badge: 'Retenção',
  },
  {
    href: '/segmentation',
    label: 'Segmentação RFM',
    icon: Users,
    badge: 'Clusters',
  },
  {
    href: '/forecasting',
    label: 'Previsão & Tendências',
    icon: TrendingUp,
    badge: 'Regressão',
  },
  {
    href: '/import',
    label: 'Ingestão de Dados',
    icon: UploadCloud,
    badge: 'CSV',
  },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { dataSource, filteredOrders } = useData();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950/95 md:bg-zinc-950/90 border-r border-zinc-800/80 flex flex-col flex-shrink-0 min-h-screen text-zinc-300 transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-zinc-950 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight text-white">PulseMetrics</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">Revenue & Retention Intelligence</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto" aria-label="Navegação Principal">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Módulos Analíticos
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive
                        ? 'text-emerald-400'
                        : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* System Status / Data Engine Badge */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fonte Ativa:</span>
              </div>
              <span
                className={`font-semibold capitalize px-2 py-0.5 rounded text-[11px] ${
                  dataSource === 'supabase'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : dataSource === 'csv'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {dataSource === 'supabase'
                  ? 'Supabase DB'
                  : dataSource === 'csv'
                  ? 'CSV Custom'
                  : 'Demo 5.2k'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
              <span>Transações Filtradas:</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {filteredOrders.length.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
