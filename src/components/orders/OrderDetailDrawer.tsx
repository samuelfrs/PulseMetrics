'use client';

import React from 'react';
import { Order, OrderItem } from '@/types/analytics';
import {
  X,
  ShoppingBag,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Code2,
  Package,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

interface OrderDetailDrawerProps {
  order: Order | null;
  items: OrderItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailDrawer({ order, items, isOpen, onClose }: OrderDetailDrawerProps) {
  const { openSqlInspector } = useData();

  if (!isOpen || !order) return null;

  // Filter items belonging to this order, or fallback to order.items, or default single item
  const orderItems: OrderItem[] =
    items.filter((it) => it.order_id === order.order_id).length > 0
      ? items.filter((it) => it.order_id === order.order_id)
      : order.items && order.items.length > 0
      ? order.items
      : [
          {
            order_item_id: `ITEM-1`,
            order_id: order.order_id,
            product_id: 'PROD-GENERIC',
            product_category: 'Item Principal',
            price: order.total_amount,
            freight_value: 0,
          },
        ];

  const totalItemsCount = orderItems.length;
  const subtotal = orderItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalFreight = orderItems.reduce((sum, it) => sum + (Number(it.freight_value) || 0), 0);

  const formattedDate = new Date(order.order_purchase_timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base font-mono">
                    {order.order_id}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {order.order_status || 'entregue'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Recibo Detalhado da Transação</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Fechar detalhe do pedido"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer & Timestamp Card */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-medium text-zinc-200">
                      {order.customer_name || 'Cliente'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    ID: {order.customer_id}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold">{order.customer_state || 'SP'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5 capitalize font-mono text-[11px] text-zinc-300">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{order.payment_method || 'Cartão'}</span>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Itens no Pedido ({totalItemsCount})</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">1:N Join</span>
              </div>

              <div className="divide-y divide-zinc-800/80 border border-zinc-800/80 rounded-xl bg-zinc-900/40 overflow-hidden">
                {orderItems.map((item, idx) => (
                  <div key={item.order_item_id || idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-zinc-900/60 transition">
                    <div className="space-y-0.5 max-w-[240px]">
                      <p className="font-medium text-zinc-100 truncate">
                        {item.product_category || 'Produto'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <span>{item.order_item_id || `ITEM-${idx + 1}`}</span>
                        {item.product_id && <span>• {item.product_id}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-semibold text-zinc-100 font-mono">
                        R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal dos Produtos:</span>
                <span className="font-mono text-zinc-200">
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {totalFreight > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Frete:</span>
                  <span className="font-mono text-zinc-200">
                    R$ {totalFreight.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                <span>Valor Total da Transação:</span>
                <span className="text-emerald-400 font-mono text-base">
                  R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-zinc-800/80 bg-zinc-900/40 space-y-3">
            <button
              onClick={() => openSqlInspector('order_items_join')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspecionar Consulta SQL deste Pedido (JOIN)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
