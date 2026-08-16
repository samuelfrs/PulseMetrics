'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { ShoppingBag, DollarSign, CreditCard, Sparkles, Code2 } from 'lucide-react';

export default function OrdersPage() {
  const { filteredOrders, items, kpis, openSqlInspector, isLoading } = useData();

  const totalGmv = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const avgTicket = filteredOrders.length > 0 ? totalGmv / filteredOrders.length : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Explorador de Transações & Pedidos
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Relacionamento 1:N
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Consulte transações individuais, carrinhos de compras consolidados e a lista de produtos comprados em cada pedido.
          </p>
        </div>

        <button
          onClick={() => openSqlInspector('order_items_join')}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
        >
          <Code2 className="w-4 h-4" />
          <span>Ver SQL do Relacionamento 1:N</span>
        </button>
      </div>

      {/* Summary KPI Mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Total de Pedidos Filtrados</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {filteredOrders.length.toLocaleString('pt-BR')}
          </p>
          <p className="text-[11px] text-zinc-400">Carrinhos únicos transacionados</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Receita Filtrada (GMV)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            R$ {totalGmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400">Volume financeiro acumulado</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Ticket Médio por Carrinho</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400">Gasto médio por pedido</p>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Carregando transações...</p>
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} items={items} />
      )}
    </div>
  );
}
