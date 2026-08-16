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
  Lock,
  X,
  KeyRound,
  AlertCircle,
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

const ADMIN_MASTER_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_SYNC_PASSWORD || 'samuel0102';

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
  
  // Password Protection Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOpenSyncModal = () => {
    if (isAuthenticated) {
      executeSync();
    } else {
      setPasswordError(false);
      setPasswordInput('');
      setIsPasswordModalOpen(true);
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setIsPasswordModalOpen(false);
      executeSync();
    } else {
      setPasswordError(true);
    }
  };

  const executeSync = async () => {
    setSyncStatus('syncing');
    const result = await syncCurrentDataToSupabase();
    if (result.success) {
      setSyncStatus('synced');
      setSyncMessage(`${result.count} registros gravados com segurança no Supabase!`);
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
      alert('Nenhum dado encontrado no Supabase ainda. Você pode salvar o lote atual clicando em "Salvar no Supabase" (Área Admin protegida por senha)!');
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

        {/* Sync to Supabase Button (Protected) */}
        <button
          onClick={handleOpenSyncModal}
          disabled={syncStatus === 'syncing'}
          title="Salvar lote ativo no Supabase PostgreSQL (Protegido por senha)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition group"
        >
          {syncStatus === 'syncing' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Gravando...</span>
            </>
          ) : syncStatus === 'synced' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Gravado!</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-amber-400/80 group-hover:text-amber-400" />
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

      {/* Admin Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-zinc-100 font-semibold text-base">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span>Área Restrita do Administrador</span>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Esta ação gravará os dados ativos diretamente nas tabelas de produção do Supabase. Digite sua senha de administrador para autorizar:
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Senha de Administrador
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Digite a senha..."
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Senha incorreta. Verifique e tente novamente.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-900 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition shadow-lg shadow-emerald-600/20"
                >
                  Autorizar & Gravar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
