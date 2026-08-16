'use client';

import React from 'react';
import { RfmSegmentStats } from '@/types/analytics';
import { Users, DollarSign, ArrowRight, Lightbulb } from 'lucide-react';

interface SegmentCardsProps {
  segments: RfmSegmentStats[];
  selectedSegment: string | null;
  onSelectSegment: (segment: string | null) => void;
}

export function SegmentCards({
  segments,
  selectedSegment,
  onSelectSegment,
}: SegmentCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {segments.map((seg) => {
        const isSelected = selectedSegment === seg.segment;

        return (
          <div
            key={seg.segment}
            onClick={() => onSelectSegment(isSelected ? null : seg.segment)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              isSelected
                ? 'bg-zinc-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700/80'
            }`}
          >
            {/* Top row */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <h4 className="font-semibold text-sm text-zinc-100">{seg.segment}</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {seg.percentageOfCustomers}% base
                </span>
              </div>

              {/* Numbers */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                  <div className="text-[11px] text-zinc-400">Clientes</div>
                  <div className="text-base font-bold font-mono text-zinc-100">
                    {seg.customerCount.toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                  <div className="text-[11px] text-zinc-400">Receita Total</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    R$ {seg.totalRevenue >= 1000 ? `${(seg.totalRevenue / 1000).toFixed(1)}k` : seg.totalRevenue}
                  </div>
                </div>
              </div>

              {/* Ticket & Frequency */}
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Ticket: R$ {seg.avgOrderValue.toFixed(0)}</span>
                <span>Freq: {seg.avgFrequency}x</span>
                <span>Rec: {seg.avgRecencyDays}d</span>
              </div>
            </div>

            {/* Action recommendation */}
            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-xs text-zinc-300">
              <div className="flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-300 leading-snug">
                  {seg.actionRecommendation}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
