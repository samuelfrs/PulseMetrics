'use client';

import React, { useState, useMemo } from 'react';
import { RfmCustomer } from '@/types/analytics';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface CustomerRfmTableProps {
  customers: RfmCustomer[];
  selectedSegmentFilter: string | null;
}

export function CustomerRfmTable({
  customers,
  selectedSegmentFilter,
}: CustomerRfmTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'monetary' | 'recency_days' | 'frequency'>('monetary');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredList = useMemo(() => {
    let list = customers;
    if (selectedSegmentFilter) {
      list = list.filter((c) => c.segment === selectedSegmentFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(lower) ||
          c.customer_id.toLowerCase().includes(lower) ||
          c.customer_state.toLowerCase().includes(lower)
      );
    }

    list = [...list].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });

    return list;
  }, [customers, selectedSegmentFilter, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredList.length / pageSize);
  const paginatedList = filteredList.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: 'monetary' | 'recency_days' | 'frequency') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'Champions':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Loyal Customers':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Potential Loyalists':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'New Promising Customers':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'At Risk / Churn Alert':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Hibernating / Cold':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
      {/* Search and count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-zinc-100">
            Detalhamento Individual de Clientes & Scores
          </h4>
          <p className="text-xs text-zinc-400">
            {filteredList.length.toLocaleString('pt-BR')} clientes encontrados{' '}
            {selectedSegmentFilter && (
              <span className="text-emerald-400 font-semibold">• Filtro: {selectedSegmentFilter}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, ID ou UF..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-zinc-950/80 border border-zinc-800 text-zinc-100 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/80 transition w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-3 px-3">Cliente</th>
              <th className="py-3 px-2">UF</th>
              <th
                onClick={() => toggleSort('recency_days')}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200"
              >
                <div className="flex items-center gap-1">
                  <span>Recência (Dias)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('frequency')}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200"
              >
                <div className="flex items-center gap-1">
                  <span>Frequência</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('monetary')}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200"
              >
                <div className="flex items-center gap-1">
                  <span>Valor Total (LTV)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Score RFM (1-5)</th>
              <th className="py-3 px-3">Segmento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {paginatedList.map((c) => (
              <tr key={c.customer_id} className="hover:bg-zinc-800/30 transition">
                <td className="py-2.5 px-3">
                  <div className="font-medium text-zinc-200">{c.customer_name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">{c.customer_id}</div>
                </td>
                <td className="py-2.5 px-2 font-mono text-zinc-300">{c.customer_state}</td>
                <td className="py-2.5 px-3 font-mono text-zinc-200">{c.recency_days} dias</td>
                <td className="py-2.5 px-3 font-mono text-zinc-200">{c.frequency}x</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400 font-medium">
                  R$ {c.monetary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">
                    R:{c.r_score} F:{c.f_score} M:{c.m_score}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getSegmentBadge(
                      c.segment
                    )}`}
                  >
                    {c.segment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
          <div>
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 transition"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 transition"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
