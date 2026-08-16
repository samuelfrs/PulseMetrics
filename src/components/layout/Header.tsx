'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  Database,
  UploadCloud,
  RotateCcw,
  Sparkles,
  Check,
  CloudUpload,
  Code2,
  Filter,
} from 'lucide-react';

const BRAZIL_STATES = [
  'ALL',
  'SP',
  'RJ',
  'MG',
  'RS',
  'PR',
  'SC',
  'BA',
  'PE',
  'CE',
  'DF',
  'GO',
  'ES',
];

export function Header() {
  const {
    dataSource,
    loadDemoData,
    fetchSupabaseData,
    syncCurrentDataToSupabase,
    selectedState,
    setSelectedState,
    openSqlInspector,
    isLoading,
  } = useData();

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleSyncSupabase = async () => {
    setSyncStatus('syncing');
    const result = await syncCurrentDataToSupabase();
    if (result.success) {
      setSyncStatus('synced');
      setSyncMessage(`${result.count} registros salvos no Supabase!`);
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 4000);
    } else {
      setSyncStatus('error');
      setSyncMessage(result.error || 'Erro ao sincronizar');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  const handleLoadSupabase = async () => {
    const success = await fetchSupabaseData();
    if (!success) {
      alert('Nenhum dado encontrado no Supabase ainda. Você pode sincronizar o dataset atual com 1 clique no botão "Salvar no Supabase"!');
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: State Filter & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400 font-medium">Estado:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent text-zinc-100 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-zinc-900 text-zinc-200">
              Todos os Estados (BR)
            </option>
            {BRAZIL_STATES.filter((s) => s !== 'ALL').map((uf) => (
              <option key={uf} value={uf} className="bg-zinc-900 text-zinc-200">
                {uf}
              </option>
            ))}
          </select>
        </div>

        {syncMessage && (
          <span
            className={`text-xs px-3 py-1 rounded-lg border animate-fadeIn ${
              syncStatus === 'synced'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {syncMessage}
          </span>
        )}
      </div>

      {/* Right: Data Source Controls & Inspect SQL */}
      <div className="flex items-center gap-3">
        {/* Source Toggle Pill */}
        <div className="hidden sm:flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 text-xs">
          <button
            onClick={loadDemoData}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              dataSource === 'demo'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Demo 5.2k</span>
          </button>

          <button
            onClick={handleLoadSupabase}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              dataSource === 'supabase'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase DB</span>
          </button>
        </div>

        {/* Sync to Supabase Button */}
        <button
          onClick={handleSyncSupabase}
          disabled={syncStatus === 'syncing'}
          title="Salvar lote atual de pedidos diretamente nas tabelas do PostgreSQL no Supabase"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition"
        >
          {syncStatus === 'syncing' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : syncStatus === 'synced' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sincronizado!</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salvar no Supabase</span>
            </>
          )}
        </button>

        {/* Master Inspect SQL Button */}
        <button
          onClick={() => openSqlInspector('kpi_mom_growth')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
        >
          <Code2 className="w-4 h-4" />
          <span>Ver Queries SQL</span>
        </button>
      </div>
    </header>
  );
}
