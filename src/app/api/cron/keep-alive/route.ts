import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const cronSecret = process.env.CRON_SECRET;

    // Se houver CRON_SECRET configurado, verificar segurança
    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      // Permitir em modo dev para testes manuais
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const startTime = Date.now();

    // Executa uma consulta leve no banco para impedir suspensão por inatividade
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: 'warning',
          message: 'Supabase ping executado com ressalva',
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase Keep-Alive executado com sucesso!',
      latencyMs,
      customersCount: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Falha ao executar Keep-Alive',
        error: err?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
