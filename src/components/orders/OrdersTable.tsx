'use client';

import React, { useState, useMemo } from 'react';
import { Order, OrderItem } from '@/types/analytics';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ExternalLink,
  Calendar,
  CreditCard,
  CheckCircle2,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { OrderDetailDrawer } from './OrderDetailDrawer';

interface OrdersTableProps {
  orders: Order[];
  items: OrderItem[];
}

export function OrdersTable({ orders, items }: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Precompute map of order_id -> count of items
  const itemsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      map.set(it.order_id, (map.get(it.order_id) || 0) + 1);
    });
    return map;
  }, [items]);

  // Filtered and searched orders
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return orders;

    return orders.filter((o) => {
      const matchOrderId = o.order_id.toLowerCase().includes(term);
      const matchCustName = o.customer_name?.toLowerCase().includes(term);
      const matchCustId = o.customer_id.toLowerCase().includes(term);
      const matchState = o.customer_state?.toLowerCase().includes(term);
      return matchOrderId || matchCustName || matchCustId || matchState;
    });
  }, [orders, searchTerm]);

  // Sorted orders
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.order_purchase_timestamp).getTime() - new Date(a.order_purchase_timestamp).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.order_purchase_timestamp).getTime() - new Date(b.order_purchase_timestamp).getTime();
      }
      if (sortBy === 'amount_desc') {
        return Number(b.total_amount) - Number(a.total_amount);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.total_amount) - Number(b.total_amount);
      }
      return 0;
    });
  }, [filteredList, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedList.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const totalFilteredGmv = useMemo(() => {
    return filteredList.reduce((sum, o) => sum + Number(o.total_amount), 0);
  }, [filteredList]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por ID do pedido, cliente ou UF..."
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Sort & Quick Summary */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Mais Recentes</option>
              <option value="date_asc">Mais Antigos</option>
              <option value="amount_desc">Maior Valor (R$)</option>
              <option value="amount_asc">Menor Valor (R$)</option>
            </select>
          </div>

          <div className="text-xs text-zinc-400 hidden sm:block font-mono">
            Total: <span className="text-zinc-200 font-bold">{filteredList.length}</span> pedidos
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-zinc-800/80 rounded-2xl bg-zinc-950/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider text-[11px] border-b border-zinc-800/80">
              <tr>
                <th className="px-5 py-3.5">ID do Pedido</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Data & Hora</th>
                <th className="px-5 py-3.5 text-center">Itens (1:N)</th>
                <th className="px-5 py-3.5">Pagamento</th>
                <th className="px-5 py-3.5 text-right">Valor Total (R$)</th>
                <th className="px-5 py-3.5 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum pedido encontrado com o filtro aplicado.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const itemCount =
                    itemsCountMap.get(order.order_id) ||
                    (order.items && order.items.length) ||
                    1;

                  const dateFormatted = new Date(order.order_purchase_timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={order.order_id}
                      onClick={() => handleOpenDetail(order)}
                      className="hover:bg-zinc-900/60 transition cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-white group-hover:text-emerald-400 transition">
                        {order.order_id}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5 max-w-[200px]">
                          <p className="font-medium text-zinc-200 truncate">
                            {order.customer_name || `Cliente ${order.customer_id}`}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            UF: {order.customer_state || 'SP'} • {order.customer_id}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-zinc-400 font-mono">
                        {dateFormatted}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                          <Package className="w-3 h-3 text-emerald-400" />
                          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 capitalize text-zinc-400 font-mono text-[11px]">
                        {order.payment_method || 'Cartão'}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-bold text-zinc-100 text-sm">
                        R$ {Number(order.total_amount).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(order);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition"
                          title="Ver recibo do pedido"
                          aria-label={`Ver recibo do pedido ${order.order_id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div>
            Mostrando página <span className="font-semibold text-zinc-200">{currentPage}</span> de{' '}
            <span className="font-semibold text-zinc-200">{totalPages}</span> ({filteredList.length} pedidos)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-300 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Order Detail */}
      <OrderDetailDrawer
        order={selectedOrder}
        items={items}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
