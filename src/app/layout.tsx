import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';
import { SqlInspectorModal } from '@/components/sql-inspector/SqlInspectorModal';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'PulseMetrics — Inteligência de Receita, Retenção & RFM',
    template: '%s | PulseMetrics',
  },
  description:
    'Data App analítico de alta performance para Inteligência de Receita (GMV), Análise de Retenção por Coortes e Segmentação RFM de Clientes construído com Next.js, TypeScript e Supabase PostgreSQL.',
  keywords: [
    'PulseMetrics',
    'Analytics',
    'Data App',
    'Cohort Analysis',
    'Matriz de Coortes',
    'Segmentação RFM',
    'Next.js',
    'PostgreSQL',
    'Supabase',
    'SaaS Metrics',
    'E-commerce Analytics',
    'Business Intelligence',
    'Growth Hacking',
  ],
  authors: [{ name: 'Samuel' }],
  creator: 'Samuel',
  publisher: 'PulseMetrics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://pulse-metrics-one.vercel.app',
    title: 'PulseMetrics — Inteligência de Receita, Retenção & RFM',
    description:
      'Plataforma analítica de alta performance para análise de coortes, segmentação de clientes RFM e projeção de receita com consultas SQL inspecionáveis.',
    siteName: 'PulseMetrics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseMetrics — Inteligência de Receita & Retenção',
    description:
      'Data App analítico moderno com Next.js, Supabase, Coortes e RFM.',
    creator: '@samuel',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex selection:bg-emerald-500/30 selection:text-emerald-200 font-sans">
        <DataProvider>
          <AppShell>{children}</AppShell>
          {/* Master Behind the Metric SQL Inspector */}
          <SqlInspectorModal />
        </DataProvider>
      </body>
    </html>
  );
}
