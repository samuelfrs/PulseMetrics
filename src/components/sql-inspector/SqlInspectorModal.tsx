'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { SQL_QUERIES_CATALOG } from '@/lib/sql-queries/queriesCatalog';
import { X, Copy, Check, Database, Code2, Sparkles, BookOpen } from 'lucide-react';

export function SqlInspectorModal() {
  const { inspectQueryId, closeSqlInspector } = useData();
  const [copied, setCopied] = useState(false);

  if (!inspectQueryId) return null;

  const queryInfo = SQL_QUERIES_CATALOG[inspectQueryId] || {
    id: inspectQueryId,
    title: 'Consulta Analítica Customizada',
    category: 'kpi',
    complexity: 'Avançado',
    keyFeatures: ['SQL Postgres', 'Window Functions', 'CTEs'],
    businessRationale: 'Query gerada dinamicamente para computação da métrica selecionada.',
    statisticalConcept: 'Agregação analítica sobre dados transacionais.',
    sqlCode: `-- Query ${inspectQueryId}\nSELECT * FROM orders;`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(queryInfo.sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'Expert':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Avançado':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Intermediário':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-100">{queryInfo.title}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getComplexityBadge(
                    queryInfo.complexity
                  )}`}
                >
                  {queryInfo.complexity}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Behind the Metric • Query SQL Analítica (PostgreSQL Engine)
              </p>
            </div>
          </div>
          <button
            onClick={closeSqlInspector}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Business & Statistical Concept */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                <span>Impacto no Negócio</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                {queryInfo.businessRationale}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Conceito Estatístico / Algorítmico</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300">
                {queryInfo.statisticalConcept}
              </p>
            </div>
          </div>

          {/* Key Features Badges */}
          {queryInfo.keyFeatures && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Recursos SQL Utilizados:</span>
              {queryInfo.keyFeatures.map((feat, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {feat}
                </span>
              ))}
            </div>
          )}

          {/* SQL Editor View */}
          <div className="relative rounded-xl border border-zinc-800 bg-[#0d1117] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/80">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL 17.x / Supabase Analytics Engine</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[380px] selection:bg-emerald-500/30 selection:text-white">
              <code>{queryInfo.sqlCode}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            💡 Dica: Esta query pode ser executada diretamente no SQL Editor do Supabase ou em qualquer cliente PostgreSQL.
          </div>
          <button
            onClick={closeSqlInspector}
            className="px-4 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
