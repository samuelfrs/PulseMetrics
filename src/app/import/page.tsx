'use client';

import React from 'react';
import { CsvUploader } from '@/components/import/CsvUploader';
import { UploadCloud, FileText, Database, ShieldAlert, CheckCircle } from 'lucide-react';

export default function ImportPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Ingestão de Dados & Parser de Vendas
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              CSV Parser
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Faça upload do extrato de transações da sua empresa (ex: Shopify, Stripe, WooCommerce, ERP) para visualizar as métricas com seus próprios dados.
          </p>
        </div>
      </div>

      {/* Main CSV Uploader Component */}
      <CsvUploader />

      {/* Instructions and Format Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Formatos de Dados Aceitos</span>
          </div>
          <ul className="text-xs text-zinc-300 space-y-2 leading-relaxed list-disc list-inside">
            <li>
              <strong>Valores Monetários:</strong> Tanto formato brasileiro (<code className="text-emerald-400">R$ 1.250,50</code>) quanto padrão americano (<code className="text-emerald-400">1250.50</code>).
            </li>
            <li>
              <strong>Datas:</strong> Padrão ISO (<code className="text-emerald-400">YYYY-MM-DD</code>) ou formato brasileiro (<code className="text-emerald-400">DD/MM/YYYY</code>).
            </li>
            <li>
              <strong>Identificadores:</strong> IDs de pedidos e clientes alfanuméricos ou e-mails/CPFs.
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
            <Database className="w-4 h-4" />
            <span>Privacidade & Processamento Local</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            O parsing do arquivo CSV ocorre <strong>100% no seu navegador</strong>. Nenhum dado de clientes é compartilhado com terceiros a menos que você clique explicitamente em <em>"Salvar no Supabase"</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
