import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Polyfill seguro de WebSocket para compatibilidade com versões antigas do Node.js
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocketPolyfill {};
}

// Carrega .env.local caso exista (para execuções locais diretas)
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

loadEnvLocal();

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://ggorriqjhfisqvznqwvf.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnb3JyaXFqaGZpc3F2em5xd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTg3MTQsImV4cCI6MjEwMjQ3NDcxNH0.NDNSSUKSZ8nKj6hoZwYoactxTFV_3VWmT2VHHgX_Oto';

async function touchDatabase() {
  console.log(`[PulseMetrics Keep-Alive] Iniciando touch no Supabase...`);
  console.log(`[Timestamp]: ${new Date().toISOString()}`);
  console.log(`[Target URL]: ${supabaseUrl}`);

  const startTime = Date.now();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    const { count, error, status } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error(`❌ [Erro ao tocar no banco]: ${error.message} (HTTP ${status})`);
      process.exitCode = 1;
      return;
    }

    console.log(`✅ [Sucesso]: Supabase ativo e respondendo!`);
    console.log(`📊 [Registros detectados em 'customers']: ${count ?? 0}`);
    console.log(`⚡ [Latência]: ${latencyMs}ms`);
  } catch (err) {
    console.error(`💥 [Exceção inesperada]:`, err);
    process.exitCode = 1;
  }
}

touchDatabase();

