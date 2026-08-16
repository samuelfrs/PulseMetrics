# 🚀 PulseMetrics: Especificação Completa & Guia de Implementação

> **Plataforma de Inteligência de Receita, Retenção e Comportamento de Clientes (SaaS & E-commerce Data App)**  
> Um projeto prático de alto impacto unindo **Engenharia Fullstack (Next.js + TypeScript)** com **Análise de Dados Avançada (SQL Analítico, Estatística e Visualização de Dados)**.

---

## 📌 Sumário
1. [Visão Geral e Proposta de Valor](#1-visão-geral-e-proposta-de-valor)
2. [Arquitetura e Stack Tecnológica](#2-arquitetura-e-stack-tecnológica)
3. [Modelagem do Banco de Dados & Schema](#3-modelagem-do-banco-de-dados--schema)
4. [As Queries SQL Analíticas (O Coração dos Dados)](#4-as-queries-sql-analíticas-o-coração-dos-dados)
   - 4.1. KPIs Executivos & Ticket Médio
   - 4.2. Matriz de Coortes (Cohort Retention Matrix)
   - 4.3. Algoritmo de Segmentação RFM
   - 4.4. Projeção de Tendência (Linear Regression / Moving Average)
5. [Estrutura de Pastas e Componentes (Next.js 14+)](#5-estrutura-de-pastas-e-componentes-nextjs-14)
6. [Telas & Interface (UI/UX)](#6-telas--interface-uiux)
7. [Diferencial Matador: Botão "Inspect SQL / Behind the Metric"](#7-diferencial-matador-botão-inspect-sql--behind-the-metric)
8. [Passo a Passo de Execução (Roadmap de Construção)](#8-passo-a-passo-de-execução-roadmap-de-construção)
9. [Como Apresentar no Portfólio, GitHub e LinkedIn](#9-como-apresentar-no-portfólio-github-e-linkedin)

---

## 1. Visão Geral e Proposta de Valor

### O Problema de Negócio
Empresas digitais perdem milhões por não entenderem a dinâmica de retenção de clientes, quem são seus consumidores de alto valor (LTV) e quando os clientes fiéis entram em risco de *churn* (abandono).

### A Solução
O **PulseMetrics** é um Data App analítico interativo que ingere transações comerciais, aplica modelagem matemática/estatística e entrega visualizações executivas acionáveis com alta velocidade e design moderno.

---

## 2. Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Motivo da Escolha |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), TypeScript | Padrão da indústria para aplicações web modernas e velozes. |
| **Estilização** | Tailwind CSS + Lucide Icons | Design limpo, profissional, com suporte nativo a Dark Mode. |
| **Gráficos & Charts** | Recharts ou Tremor | Componentes visuais ricos, responsivos e fáceis de customizar. |
| **Banco de Dados** | PostgreSQL ou DuckDB / SQLite | Banco relacional para execução de SQL analítico pesado. |
| **Camada Analítica** | Node.js / TypeScript Server Functions (ou FastAPI Python) | Execução de agregações, regressão linear e segmentação RFM. |

---

## 3. Modelagem do Banco de Dados & Schema

O banco de dados é estruturado em torno de transações de clientes, produtos e pedidos.

```sql
-- 1. Tabela de Clientes
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_state VARCHAR(2), -- Ex: 'CE', 'SP', 'RJ'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Pedidos
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id),
    order_status VARCHAR(20) NOT NULL, -- 'delivered', 'canceled', 'shipped'
    order_purchase_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) -- 'credit_card', 'pix', 'boleto'
);

-- 3. Tabela de Itens do Pedido
CREATE TABLE order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id),
    product_id VARCHAR(50) NOT NULL,
    product_category VARCHAR(50) NOT NULL, -- 'eletronicos', 'vestuario', 'casa'
    price NUMERIC(10, 2) NOT NULL,
    freight_value NUMERIC(10, 2) NOT NULL
);
```

---

## 4. As Queries SQL Analíticas (O Coração dos Dados)

### 4.1. KPIs Executivos & Variação Mês a Mês (MoM)
Esta query calcula faturamento, pedidos e ticket médio agrupados por mês, usando a Window Function `LAG()` para calcular a taxa de crescimento.

```sql
WITH monthly_metrics AS (
    SELECT 
        DATE_TRUNC('month', order_purchase_timestamp) AS order_month,
        COUNT(DISTINCT order_id) AS total_orders,
        COUNT(DISTINCT customer_id) AS active_customers,
        SUM(total_amount) AS gmv,
        ROUND(AVG(total_amount), 2) AS average_order_value
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY DATE_TRUNC('month', order_purchase_timestamp)
)
SELECT 
    order_month,
    total_orders,
    gmv,
    average_order_value,
    -- Cálculo da variação percentual de receita mês a mês (MoM Growth)
    ROUND(
        ((gmv - LAG(gmv) OVER (ORDER BY order_month)) / 
        NULLIF(LAG(gmv) OVER (ORDER BY order_month), 0)) * 100, 
        2
    ) AS gmv_growth_percent
FROM monthly_metrics
ORDER BY order_month DESC;
```

---

### 4.2. Matriz de Coortes de Retenção (Cohort Analysis)
Calcula o mês da primeira compra de cada cliente (coorte) e rastreia em quais meses subsequentes ele voltou a comprar.

```sql
WITH first_purchase AS (
    -- Identifica o mês em que o cliente fez sua primeira compra (Coorte de Origem)
    SELECT 
        customer_id,
        DATE_TRUNC('month', MIN(order_purchase_timestamp)) AS cohort_month
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY customer_id
),
customer_activities AS (
    -- Mapeia todas as compras do cliente e calcula o índice do mês decorrido
    SELECT 
        o.customer_id,
        fp.cohort_month,
        DATE_TRUNC('month', o.order_purchase_timestamp) AS activity_month,
        (
            EXTRACT(YEAR FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(YEAR FROM fp.cohort_month)
        ) * 12 + (
            EXTRACT(MONTH FROM DATE_TRUNC('month', o.order_purchase_timestamp)) - EXTRACT(MONTH FROM fp.cohort_month)
        ) AS month_number
    FROM orders o
    JOIN first_purchase fp ON o.customer_id = fp.customer_id
    WHERE o.order_status = 'delivered'
),
cohort_size AS (
    -- Tamanho total inicial de cada coorte (Mês 0)
    SELECT 
        cohort_month,
        COUNT(DISTINCT customer_id) AS total_customers_cohort
    FROM first_purchase
    GROUP BY cohort_month
)
SELECT 
    ca.cohort_month,
    cs.total_customers_cohort AS cohort_size,
    ca.month_number,
    COUNT(DISTINCT ca.customer_id) AS active_customers,
    ROUND((COUNT(DISTINCT ca.customer_id)::NUMERIC / cs.total_customers_cohort) * 100, 1) AS retention_rate_percentage
FROM customer_activities ca
JOIN cohort_size cs ON ca.cohort_month = cs.cohort_month
GROUP BY ca.cohort_month, cs.total_customers_cohort, ca.month_number
ORDER BY ca.cohort_month ASC, ca.month_number ASC;
```

---

### 4.3. Algoritmo de Segmentação RFM (Recência, Frequência, Valor)
Divide a base em quartis ou pontuações de 1 a 5 usando a Window Function `NTILE()`:

```sql
WITH customer_rfm_raw AS (
    SELECT 
        customer_id,
        -- Recência: Dias desde a última compra até hoje (ou data de corte)
        DATE_PART('day', CURRENT_TIMESTAMP - MAX(order_purchase_timestamp)) AS recency_days,
        -- Frequência: Total de pedidos entregues
        COUNT(DISTINCT order_id) AS frequency,
        -- Valor: Total gasto
        SUM(total_amount) AS monetary
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY customer_id
),
rfm_scores AS (
    SELECT 
        customer_id,
        recency_days,
        frequency,
        monetary,
        -- Menor recência = melhor nota (5)
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score,
        -- Maior frequência = melhor nota (5)
        NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
        -- Maior valor monetário = melhor nota (5)
        NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
    FROM customer_rfm_raw
)
SELECT 
    customer_id,
    recency_days,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score <= 2 AND f_score >= 3 AND m_score >= 3 THEN 'At Risk / Churn Alert'
        WHEN r_score >= 4 AND f_score = 1 THEN 'New Promising Customers'
        ELSE 'Lost / Low Value'
    END AS segment_label
FROM rfm_scores;
```

---

### 4.4. Projeção de Tendência Linear (Forecasting)
Fórmula matemática de regressão linear para projeção de receita dos próximos períodos:

$$\text{Slope } (m) = \frac{N \sum(xy) - \sum x \sum y}{N \sum(x^2) - (\sum x)^2}$$

$$\text{Intercept } (b) = \frac{\sum y - m \sum x}{N}$$

$$\hat{y} = m \cdot x + b$$

---

## 5. Estrutura de Pastas (Next.js 14+ App Router)

```
pulse-metrics/
├── public/
│   └── data/
│       └── transactions.json      # Dataset realista (~5k a 10k registros)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Layout global com Sidebar & Header
│   │   ├── page.tsx               # Dashboard Geral (KPIs & Receita)
│   │   ├── cohorts/
│   │   │   └── page.tsx           # Página do Heatmap de Coortes
│   │   ├── segmentation/
│   │   │   └── page.tsx           # Página da Matriz RFM de Clientes
│   │   └── forecasting/
│   │       └── page.tsx           # Página de Projeção & Tendências
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx        # Card métrico com variação % MoM
│   │   │   ├── RevenueChart.tsx   # Gráfico de faturamento histórico
│   │   │   └── CategoryPie.tsx    # Distribuição de vendas por categoria
│   │   ├── cohorts/
│   │   │   └── CohortHeatmap.tsx  # Matriz colorida de retenção
│   │   ├── rfm/
│   │   │   ├── RfmScatterPlot.tsx # Gráfico de dispersão dos clusters
│   │   │   └── SegmentStats.tsx   # Distribuição de receita por segmento
│   │   ├── forecasting/
│   │   │   └── ForecastChart.tsx  # Gráfico histórico + Projeção futura
│   │   ├── sql-inspector/
│   │   │   └── SqlInspectorModal.tsx # Drawer/Modal com código SQL formatado
│   │   └── ui/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── DateRangeFilter.tsx
│   │       └── Badge.tsx
│   ├── lib/
│   │   ├── analytics/
│   │   │   ├── cohortCalculator.ts
│   │   │   ├── rfmEngine.ts
│   │   │   └── linearRegression.ts
│   │   ├── sql-queries/
│   │   │   └── queriesCatalog.ts  # Catálogo com todas as queries formatadas
│   │   └── dataLoader.ts
│   └── types/
│       └── analytics.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Telas & Interface (UI/UX)

### 📊 1. Visão Geral (Overview)
* **KPIs no Topo:** Faturamento Total, Ticket Médio, Total de Pedidos, Taxa de Recompra.
* **Gráfico de Faturamento Temporal:** Área/Linhas suaves mostrando receita diária e média móvel de 7 dias.
* **Filtros Globais:** Seletor de período (Últimos 30 dias, 90 dias, 1 ano) e filtro por estado/região.

### 🧩 2. Matriz de Coortes (Cohorts)
* Tabela em estilo Heatmap com escala de cor (verde/azul suave) onde 100% no mês 0 transiciona para as porcentagens dos meses seguintes.
* Destaque para a curva de retenção média da empresa.

### 🎯 3. Segmentação RFM
* Gráfico de dispersão (Recência no eixo X, Valor no eixo Y, tamanho do ponto = Frequência).
* Tabela com resumo dos grupos de clientes e ações sugeridas (Ex: "Campanha de reativação para clientes *At Risk*").

### 🔮 4. Previsão (Forecasting)
* Gráfico de série temporal onde a linha contínua representa o histórico real e a linha pontilhada representa a projeção para os próximos 30/60 dias.

---

## 7. Módulo de Ingestão e Importação de Dados (CSV Uploader & Parser)

Para permitir que qualquer empresa ou visitante teste a plataforma com dados próprios, o projeto conta com um módulo de importação inteligente:

### Fluxo de Ingestão:
1. **Upload do Arquivo:** O usuário faz upload de um arquivo `.csv` de vendas.
2. **Auto-Detecção de Colunas:** O parser analisa o cabeçalho e tenta associar automaticamente colunas comuns (ex: `Data`, `Valor`, `Cliente`, `ID_Pedido`).
3. **Mapeamento Interativo:** Se houver divergência, o usuário seleciona manualmente qual coluna corresponde a cada campo no schema.
4. **Sanitização & Normalização:** Tratamento automático de moedas (`R$ 1.250,50` -> `1250.50`), formatos de data (`DD/MM/YYYY` ou `YYYY-MM-DD`) e remoção de registros nulos/inválidos.
5. **Recálculo em Tempo Real:** O estado global da aplicação é atualizado e todas as páginas (Overview, Coortes, RFM e Previsão) passam a refletir os dados recém-importados.

---

## 8. Diferencial Matador: Botão "Inspect SQL / Behind the Metric"

Em cada card de KPI ou gráfico, inclua um botão discreto no canto superior direito:

> `[ < > Ver SQL da Métrica ]`

Ao clicar, abre-se um modal elegante (estilo editor com *Prism.js* ou *Shiki*) com:
1. **Nome da Métrica & Conceito de Negócio:** Explicação de como a métrica gera valor.
2. **Query SQL Analítica Completa:** O código SQL formatado com sintaxe colorida (destacando CTEs e Window Functions).
3. **Complexidade Algorítmica / Fórmula Estatística:** Detalhes de cálculo.

*Isso demonstra para qualquer entrevistador ou avaliador que você domina a engenharia de dados por trás da interface gráfica.*

---

## 8. Passo a Passo de Execução (Roadmap)

1. **Dia 1 — Setup & Estrutura Inicial:**
   * Inicializar projeto Next.js com Tailwind e TypeScript (`npx create-next-app@latest`).
   * Configurar layout base (Sidebar de navegação e Header com Dark Mode).
2. **Dia 2 — Camada de Dados & Dataset:**
   * Criar dataset JSON realista (`public/data/transactions.json`) com 5.000+ pedidos variando ao longo de 12 meses.
   * Criar módulo de carregamento e tipagens TypeScript (`src/types/analytics.ts`).
3. **Dia 3 — Motores de Cálculo Analítico:**
   * Implementar as funções analíticas em TypeScript em `src/lib/analytics/`:
     * `cohortCalculator.ts` (agregação de coortes e porcentagem de retenção).
     * `rfmEngine.ts` (pontuação RFM e classificação de clusters).
     * `linearRegression.ts` (cálculo de projeção linear $y = mx + b$).
4. **Dia 4 — Construção das Páginas & Gráficos:**
   * Implementar os gráficos usando `recharts`: Área, Barras, Scatter Plot e Heatmap customizado.
   * Criar a página de Visão Geral (`/`) e a página de Coortes (`/cohorts`).
5. **Dia 5 — RFM, Previsão e Modal de SQL:**
   * Criar a página `/segmentation` e `/forecasting`.
   * Implementar o componente `SqlInspectorModal.tsx` com o catálogo de queries.
6. **Dia 6 — Polimento, Deploy & Documentação:**
   * Testar responsividade mobile e transições.
   * Fazer deploy na Vercel.
   * Escrever um `README.md` impecável no GitHub com capturas de tela e explicação das métricas.

---

## 9. Como Apresentar no Portfólio, GitHub e LinkedIn

* **Título no Portfólio:** `PulseMetrics — Plataforma Analítica de Inteligência de Receita e Retenção`
* **Descrição Curta:** *"Data App de alta performance construído em Next.js e TypeScript, aplicando SQL analítico avançado (Window Functions, CTEs), análise de coortes e segmentação RFM para análise de receita e churn."*
* **Destaques Técnicos:**
  * Processamento de matrizes de coortes e retenção ao longo de 12 meses.
  * Segmentação de clientes baseada em Recência, Frequência e Valor Monetário (RFM).
  * Módulo de projeção de vendas com regressão linear.
  * Drawer interativo com inspeção de queries SQL em tempo real.
