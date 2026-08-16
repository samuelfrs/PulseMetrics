'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Customer, Order, OrderItem } from '@/types/analytics';
import { useData } from '@/context/DataContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Download,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColumnMapping {
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_state: string;
  order_purchase_timestamp: string;
  total_amount: string;
  category?: string;
}

export function CsvUploader() {
  const { loadCsvData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [mapping, setMapping] = useState<ColumnMapping>({
    order_id: '',
    customer_id: '',
    customer_name: '',
    customer_state: '',
    order_purchase_timestamp: '',
    total_amount: '',
    category: '',
  });

  // Auto-detect matching headers
  const autoDetectColumns = (headers: string[]) => {
    const findMatch = (candidates: string[]) => {
      return (
        headers.find((h) =>
          candidates.some((c) => h.toLowerCase().trim().replace(/[-_]/g, '') === c)
        ) || ''
      );
    };

    setMapping({
      order_id: findMatch(['orderid', 'idpedido', 'idtransacao', 'pedido', 'transacao', 'id']),
      customer_id: findMatch(['customerid', 'idaluno', 'idcliente', 'clienteid', 'cpf', 'email']),
      customer_name: findMatch(['customername', 'nomecompleto', 'nomecliente', 'cliente', 'nome', 'name']),
      customer_state: findMatch(['customerstate', 'ufresidencia', 'uf', 'estado', 'state', 'regiao']),
      order_purchase_timestamp: findMatch([
        'orderpurchasetimestamp',
        'datamatricula',
        'datacompra',
        'datapedido',
        'data',
        'date',
        'timestamp',
        'createdat',
      ]),
      total_amount: findMatch([
        'totalamount',
        'valorpago',
        'valor',
        'total',
        'valortotal',
        'amount',
        'preco',
        'price',
        'receita',
      ]),
      category: findMatch(['categoriacurso', 'categoria', 'category', 'produto', 'curso']),
    });
  };

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setErrorMessage(null);
    setIsSuccess(false);

    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      preview: 5000,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setParsedHeaders(results.meta.fields);
          setRawRows(results.data);
          autoDetectColumns(results.meta.fields);
        } else {
          setErrorMessage('Não foi possível identificar o cabeçalho no arquivo CSV.');
        }
      },
      error: (err) => {
        setErrorMessage(`Erro ao ler CSV: ${err.message}`);
      },
    });
  };

  const handleLoadSampleEdTechDirectly = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/sample-datasets/edtech_digital_subscriptions.csv');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields && results.data) {
            setParsedHeaders(results.meta.fields);
            setRawRows(results.data);
            autoDetectColumns(results.meta.fields);
            
            // Auto process sample
            processAndCommit(results.data, {
              order_id: 'id_transacao',
              customer_id: 'id_aluno',
              customer_name: 'nome_completo',
              customer_state: 'uf_residencia',
              order_purchase_timestamp: 'data_matricula',
              total_amount: 'valor_pago',
              category: 'categoria_curso',
            });
          }
        },
      });
    } catch (err: any) {
      setErrorMessage(`Erro ao carregar dataset de exemplo: ${err?.message}`);
      setIsProcessing(false);
    }
  };

  const cleanNumericValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val)
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const cleanDateValue = (val: any): string => {
    if (!val) return new Date().toISOString();
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    const match = String(val).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (match) {
      const d = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    return new Date().toISOString();
  };

  const processAndCommit = (rows: any[], map: ColumnMapping) => {
    try {
      const customersMap = new Map<string, Customer>();
      const orders: Order[] = [];
      const items: OrderItem[] = [];

      rows.forEach((row, index) => {
        const orderId = map.order_id && row[map.order_id]
          ? String(row[map.order_id])
          : `ORD-CSV-${index + 1}`;

        const customerId = map.customer_id && row[map.customer_id]
          ? String(row[map.customer_id])
          : `CUST-CSV-${index + 1}`;

        const customerName = map.customer_name && row[map.customer_name]
          ? String(row[map.customer_name])
          : `Cliente ${customerId}`;

        const customerState = map.customer_state && row[map.customer_state]
          ? String(row[map.customer_state]).toUpperCase().slice(0, 2)
          : 'SP';

        const rawDate = map.order_purchase_timestamp ? row[map.order_purchase_timestamp] : null;
        const timestamp = cleanDateValue(rawDate);
        const totalAmount = cleanNumericValue(row[map.total_amount]);
        const catName = map.category && row[map.category] ? String(row[map.category]) : 'Cursos & Assinaturas';

        if (!customersMap.has(customerId)) {
          customersMap.set(customerId, {
            customer_id: customerId,
            customer_name: customerName,
            customer_state: customerState,
            created_at: timestamp,
          });
        }

        const itemObj: OrderItem = {
          order_item_id: `ITEM-CSV-${index + 1}`,
          order_id: orderId,
          product_id: `PROD-${catName.slice(0, 4).toUpperCase()}`,
          product_category: catName,
          price: totalAmount,
          freight_value: 0,
        };
        items.push(itemObj);

        orders.push({
          order_id: orderId,
          customer_id: customerId,
          customer_name: customerName,
          customer_state: customerState,
          order_status: 'delivered',
          order_purchase_timestamp: timestamp,
          total_amount: totalAmount,
          payment_method: 'credit_card',
          items: [itemObj],
        });
      });

      const customers = Array.from(customersMap.values());
      loadCsvData(customers, orders, items);

      setIsSuccess(true);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(`Erro no processamento dos dados: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualProcess = () => {
    if (!mapping.total_amount) {
      setErrorMessage('Por favor, mapeie ao menos a coluna de Valor.');
      return;
    }
    setIsProcessing(true);
    processAndCommit(rawRows, mapping);
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-8">
      {/* Header with Sample Download Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Ingestão de Dados & Parser Inteligente de CSV</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Importe dados de qualquer negócio para recalcular métricas, coortes e clusters RFM instantaneamente.
          </p>
        </div>

        {/* Quick Sample Button */}
        <div className="flex items-center gap-2">
          <a
            href="/sample-datasets/edtech_digital_subscriptions.csv"
            download="edtech_digital_subscriptions.csv"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar CSV EdTech / SaaS</span>
          </a>

          <button
            onClick={handleLoadSampleEdTechDirectly}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Carregar Exemplo EdTech Direto</span>
          </button>
        </div>
      </div>

      {/* Alternative Business Model Highlight */}
      <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <strong className="text-zinc-100 font-semibold">Exemplo Alternativo Disponível (EdTech & Assinaturas SaaS):</strong>
          <p className="text-zinc-400 leading-relaxed">
            Criamos um dataset com matrículas de cursos online, mentorias e assinaturas mensais recorrentes (<code className="text-emerald-400">id_aluno</code>, <code className="text-emerald-400">valor_pago</code>, <code className="text-emerald-400">categoria_curso</code>). Baixe o CSV acima ou clique em <em>"Carregar Exemplo EdTech Direto"</em> para ver a plataforma se adequar a outro modelo de negócio!
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/80 bg-zinc-950/60 hover:bg-zinc-900/40 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <div className="text-sm font-semibold text-zinc-200">
          {file ? file.name : 'Arraste seu arquivo .CSV aqui ou clique para selecionar'}
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Suporta arquivos de até 50.000 linhas com detecção automática de formato
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              <strong>Sucesso!</strong> {rawRows.length.toLocaleString('pt-BR')} registros importados. Todas as abas já foram recalculadas!
            </span>
          </div>
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Column Mapping Section */}
      {parsedHeaders.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-200">
              Mapeamento de Colunas do Schema
            </h4>
            <span className="text-xs text-zinc-400 font-mono">
              {rawRows.length} linhas identificadas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'order_id', label: 'ID do Pedido / Matrícula', req: false },
              { key: 'customer_id', label: 'ID do Cliente / Aluno', req: false },
              { key: 'customer_name', label: 'Nome Completo', req: false },
              { key: 'customer_state', label: 'Estado / UF', req: false },
              { key: 'order_purchase_timestamp', label: 'Data da Transação', req: false },
              { key: 'total_amount', label: 'Valor Pago (R$)', req: true },
              { key: 'category', label: 'Categoria / Curso', req: false },
            ].map(({ key, label, req }) => (
              <div key={key} className="space-y-1.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>{label}</span>
                  {req && <span className="text-emerald-400 text-[10px]">Obrigatório</span>}
                </label>
                <select
                  value={(mapping as any)[key] || ''}
                  onChange={(e) =>
                    setMapping({ ...mapping, [key]: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Não mapear --</option>
                  {parsedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleManualProcess}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition shadow-lg shadow-emerald-600/20"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>Importar e Recalcular Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
