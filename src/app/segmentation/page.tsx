'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { RfmScatterPlot } from '@/components/rfm/RfmScatterPlot';
import { SegmentCards } from '@/components/rfm/SegmentCards';
import { CustomerRfmTable } from '@/components/rfm/CustomerRfmTable';
import { Users, Sparkles, Filter, X } from 'lucide-react';

export default function SegmentationPage() {
  const { rfmCustomers, rfmSegments } = useData();
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Segmentação de Clientes RFM
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Recência • Frequência • Valor
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Algoritmo estatístico que pontua cada cliente de 1 a 5 em três dimensões comportamentais cruciais para priorizar ações de retenção e reengajamento.
          </p>
        </div>

        {selectedSegmentFilter && (
          <div className="flex items-center gap-2 bg-zinc-950 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrando por: <strong>{selectedSegmentFilter}</strong></span>
            <button
              onClick={() => setSelectedSegmentFilter(null)}
              className="p-1 hover:bg-zinc-800 rounded-md transition text-zinc-400 hover:text-white ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 7 Segment Summary Cards */}
      <SegmentCards
        segments={rfmSegments}
        selectedSegment={selectedSegmentFilter}
        onSelectSegment={setSelectedSegmentFilter}
      />

      {/* Scatter Plot */}
      <RfmScatterPlot customers={rfmCustomers} />

      {/* Customer Detail Table */}
      <CustomerRfmTable
        customers={rfmCustomers}
        selectedSegmentFilter={selectedSegmentFilter}
      />
    </div>
  );
}
