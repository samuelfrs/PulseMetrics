# 🚀 PulseMetrics

> **Plataforma de Inteligência de Receita, Retenção (Coortes) e Segmentação RFM de Clientes**  
> Um Data App de alta performance construído com **Next.js (App Router), TypeScript, Tailwind CSS, Recharts e Supabase (PostgreSQL)**.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Vercel Cron](https://img.shields.io/badge/Vercel-Cron_Active-white?style=flat&logo=vercel)](https://vercel.com/)

---

## 📌 Visão Geral & Proposta de Valor

O **PulseMetrics** foi desenvolvido para transformar dados transacionais brutos em decisões executivas acionáveis com design moderno e velocidade instantânea.

Diferente de dashboards genéricos, a aplicação traz um diferencial técnico crucial para portfólio e produtos SaaS: o recurso **"Behind the Metric / Inspect SQL"**, permitindo inspecionar e copiar em tempo real a consulta SQL analítica (com **Window Functions**, **CTEs** e fórmulas estatísticas) por trás de cada gráfico e KPI.

---

## ✨ Funcionalidades Principais

1. 📊 **Painel Executivo de Receita (Overview):**
   - KPIs em tempo real: Faturamento Total (GMV), Volume de Pedidos, Ticket Médio e Taxa de Recompra.
   - Variação mês a mês (*MoM Growth*) calculada com a window function `LAG()`.
   - Gráfico de área suave com histórico de vendas e distribuição por categoria de produto.
   - Filtro geográfico interativo por estado brasileiro (UF).

2. 🧩 **Matriz de Retenção por Coortes (Cohort Heatmap):**
   - Agrupamento de clientes pelo mês da 1ª compra (Safra / Mês 0).
   - Acompanhamento da curva de retenção mês a mês (M+0 até M+11).
   - Cálculo automático da média de retenção global e diagnóstico de risco de churn no Mês +1.

3. 🎯 **Segmentação RFM de Clientes (Recência, Frequência, Valor):**
   - Algoritmo estatístico percentilar baseado na window function `NTILE(5)`.
   - Divisão automática da base em 7 clusters acionáveis (*Champions*, *Loyal Customers*, *Potential Loyalists*, *New Promising*, *At Risk / Churn Alert*, *Hibernating*, *Lost*).
   - Gráfico de dispersão (*Scatter Plot*) interativo e tabela detalhada de clientes com busca e filtros.
   - Recomendações práticas de Growth e ações de marketing para cada grupo.

4. 🔮 **Previsão de Receita & Regressão Linear (Forecasting):**
   - Ajuste linear por Mínimos Quadrados Ordinários (OLS) sobre a série temporal de vendas diárias.
   - Projeção de receita para os próximos 30 dias com intervalos de confiança de 95%.
   - Média móvel de 7 dias e cálculo do coeficiente de determinação estatístico ($R^2$).

5. 📁 **Módulo de Ingestão de Dados & Parser de CSV:**
   - Permite que qualquer empresa teste a plataforma com dados próprios.
   - Auto-detecção de cabeçalhos, mapeamento dinâmico de colunas e sanitização de formatos de moeda e data.
   - Recálculo instantâneo de todas as telas em milissegundos sem recarregar a página.

6. 🔍 **Diferencial: Botão "Inspect SQL / Behind the Metric":**
   - Modal em cada card e gráfico contendo a query SQL completa formatada, conceito estatístico, justificativa de negócio e botão de cópia.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
|---|---|---|
| **Framework Web** | Next.js 15+ (App Router) | Renderização híbrida, performance e rotas de API |
| **Linguagem** | TypeScript | Tipagem estrita de schemas analíticos e entidades |
| **Estilização** | Tailwind CSS v4 | Design minimalista, elegante, Dark Mode de alto contraste |
| **Gráficos** | Recharts | Gráficos responsivos de Área, Linha, Dispersão e Barras |
| **Banco de Dados** | Supabase (PostgreSQL) | Banco relacional analítico hospedado na região `sa-east-1` |
| **Rotinas Automáticas** | Vercel Cron | Endpoint Keep-Alive para prevenir inatividade no banco |
| **Parser CSV** | PapaParse | Ingestão e processamento de arquivos client-side |

---

## ⚙️ Como Rodar Localmente

### 1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/PulseMetrics.git
cd PulseMetrics
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Configure as variáveis de ambiente:
Crie o arquivo `.env.local` na raiz do projeto (use o `.env.example` como base):
```env
NEXT_PUBLIC_SUPABASE_URL=https://ggorriqjhfisqvznqwvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
CRON_SECRET=seu-token-secreto-aqui
```

### 4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para explorar a aplicação.

---

## 🗄️ Estrutura do Banco de Dados (Supabase / PostgreSQL)

O schema está salvo em `src/lib/supabase/schema.sql`:

```sql
-- 1. Clientes
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_state VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pedidos
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_status VARCHAR(20) NOT NULL DEFAULT 'delivered',
    order_purchase_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'credit_card'
);

-- 3. Itens do Pedido
CREATE TABLE order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_category VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    freight_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);
```

---

## 🛡️ Vercel Cron & Anti-Inatividade do Supabase

Para impedir que instâncias gratuitas do banco de dados entrem em modo *sleep* por inatividade de 7 dias, foi configurado o arquivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/keep-alive",
      "schedule": "0 10 * * 1,4"
    }
  ]
}
```

A rota `/api/cron/keep-alive` executa periodicamente uma verificação leve com resposta JSON:
```json
{
  "status": "healthy",
  "message": "Supabase Keep-Alive executado com sucesso!",
  "latencyMs": 38,
  "customersCount": 1350
}
```

---

## 👨‍💻 Autor

Desenvolvido por **Samuel** como projeto de portfólio de alto impacto técnico unindo Engenharia de Software Fullstack e Ciência/Engenharia de Dados.
