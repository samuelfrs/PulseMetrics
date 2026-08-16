import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SqlInspectorModal } from '@/components/sql-inspector/SqlInspectorModal';

export const metadata: Metadata = {
  title: 'PulseMetrics — Inteligência de Receita, Retenção & RFM',
  description:
    'Data App analítico de alta performance construído com Next.js, TypeScript, PostgreSQL e modelagem matemática avançada.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen flex selection:bg-emerald-500/30 selection:text-emerald-200">
        <DataProvider>
          <div className="flex w-full min-h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <Header />
              <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                {children}
              </main>
            </div>
          </div>

          {/* Master Behind the Metric SQL Inspector */}
          <SqlInspectorModal />
        </DataProvider>
      </body>
    </html>
  );
}
