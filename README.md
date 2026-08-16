# 🚀 PulseMetrics

> **Plataforma de Inteligência de Receita (GMV), Análise de Retenção (Coortes), Segmentação RFM e Explorador de Transações**  
> Um Data App de alta performance construído com **Next.js (App Router), TypeScript, Tailwind CSS, Recharts e Supabase (PostgreSQL)**.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Vercel Cron](https://img.shields.io/badge/Vercel-Cron_Active-white?style=flat&logo=vercel)](https://vercel.com/)

---

## 📌 Visão Geral & Proposta de Valor

O **PulseMetrics** é uma plataforma analítica desenvolvida para transformar dados transacionais brutos em inteligência executiva acionável com design refinado e tempo de resposta instantâneo.

Diferente de dashboards puramente visuais, a aplicação foi construída com foco em **Engenharia e Ciência de Dados**, trazendo como grande diferencial o recurso **"Behind the Metric / Inspect SQL"**: cada KPI, gráfico ou recibo possui um botão que exibe a consulta SQL analítica correspondente (utilizando **Window Functions**, **CTEs**, **JOINs 1:N** e **fórmulas estatísticas**), permitindo inspecionar e copiar os scripts para uso em data warehouses como BigQuery, Snowflake ou PostgreSQL.

---

## ✨ Funcionalidades Principais

### 1. 📊 Painel Executivo de Receita (`/`)
* **KPIs em Tempo Real:** Faturamento Total (GMV), Total de Pedidos Concluídos, Ticket Médio e Taxa de Recompra.
* **Aceleração Mês a Mês (*MoM Growth*):** Variação percentual calculada via window function `LAG()`.
* **Série Temporal de Vendas:** Gráfico de área com curva histórica de faturamento mensal.
* **Distribuição por Categoria:** Participação percentual e volume financeiro por departamento/curso.
* **Filtro Geográfico Interativo:** Segmentação de todas as métricas por Estado (UF).

### 2. 🛍️ Explorador de Transações & Pedidos (`/orders`)
* **Visualização Relacional 1:N:** Tabela pesquisável com consolidação de pedidos e contagem de itens por carrinho.
* **Recibo Detalhado (*Order Detail Slide-over*):** Painel lateral estilo Stripe/Shopify mostrando dados do cliente, data, método de pagamento, itens individuais e somatório financeiro.
* **Busca e Ordenação Instantâneas:** Filtro por ID do pedido, nome do cliente ou estado, com paginação integrada.
* **Inspect SQL:** Consulta SQL com `JOIN` entre as 3 tabelas relacionais do pedido selecionado.

### 3. 🧩 Matriz de Retenção por Coortes (`/cohorts`)
* **Safra de Clientes (Mês 0):** Agrupamento automático de clientes pelo mês de sua primeira compra.
* **Acompanhamento Longitudinal (M+0 até M+11):** Heatmap visual com degradê de cores indicando a taxa de recompra de cada safra ao longo do tempo.
* **Diagnóstico de Churn:** Média global de retenção e identificação de quedas críticas de retenção no Mês +1.

### 4. 🎯 Segmentação RFM de Clientes (`/segmentation`)
* **Algoritmo Estatístico NTILE(5):** Cálculo automático de pontuação de 1 a 5 para Recência, Frequência e Valor Monetário.
* **7 Clusters Acionáveis:** *Champions*, *Loyal Customers*, *Potential Loyalists*, *New Promising*, *At Risk / Churn Alert*, *Hibernating* e *Lost*.
* **Scatter Plot Interativo:** Gráfico de dispersão (Recência vs Frequência) com tamanho de bolha proporcional ao valor gasto.
* **Plano de Ação de Marketing:** Recomendações práticas de Growth para cada grupo de clientes.

### 5. 🔮 Previsão de Receita & Regressão Linear (`/forecasting`)
* **Modelagem Estatística OLS:** Ajuste linear de Mínimos Quadrados Ordinários ($ŷ = mx + b$) sobre a série diária de vendas.
* **Projeção para os Próximos 30 Dias:** Linha de tendência futura com faixas de intervalo de confiança de 95%.
* **Média Móvel de 7 Dias:** Suavização de ruídos e cálculo do coeficiente de determinação ($R^2$).

### 6. 📁 Módulo Universal de Ingestão de Dados & CSV (`/import`)
* **Suporte Universal a Qualquer CSV:** Compatível com bases de e-commerce, EdTech, SaaS ou datasets públicos (Superstore, Olist, etc.).
* **Auto-detecção e Mapeamento:** Mapeamento inteligente de colunas com tratamento de moedas brasileiras (`R$`) e datas internacionais.
* **Consolidação de Múltiplos Itens:** Agrupa linhas de produtos no mesmo pedido sem gerar duplicatas.
* **Recálculo Instantâneo In-Memory:** Todas as páginas se adaptam imediatamente aos novos dados carregados.

### 7. 🔍 Catálogo de Consultas SQL (*Behind the Metric*)
* Modal integrado em cada card e gráfico com a query SQL analítica formatada, conceitos estatísticos, justificativa de negócio e botão de cópia com 1 clique.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
|---|---|---|
| **Framework Web** | Next.js 15+ (App Router & Turbopack) | Arquitetura moderna de componentes, rotas estáticas e de API |
| **Linguagem** | TypeScript | Tipagem estrita de schemas analíticos, entidades e props |
| **Estilização** | Tailwind CSS v4 | Design minimalista, elegante, Dark Mode de alto contraste |
| **Visualização de Dados** | Recharts | Gráficos responsivos de Área, Linha, Dispersão e Barras |
| **Banco de Dados** | Supabase (PostgreSQL) | Banco relacional analítico hospedado na região `sa-east-1` (São Paulo) |
| **Rotinas Automáticas** | Vercel Cron | Endpoint Keep-Alive para prevenção de sleep mode do banco |
| **Parser de Arquivos** | PapaParse | Ingestão e streaming de CSV no navegador |
| **Ícones & Microinterações** | Lucide React + Canvas Confetti | Interface moderna com feedbacks visuais |

---

## 🗄️ Modelo de Dados Relacional (PostgreSQL / Supabase)

O banco de dados foi modelado seguindo a 3ª Forma Normal (3NF) com índices analíticos otimizados:

```sql
-- 1. Tabela de Clientes
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150),
    customer_state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Pedidos (Carrinhos Consolidados)
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    order_status VARCHAR(30) DEFAULT 'delivered',
    order_purchase_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'credit_card'
);

-- 3. Tabela de Itens do Pedido (Relacionamento 1:N)
CREATE TABLE order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_category VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    freight_value NUMERIC(12, 2) DEFAULT 0.00
);

-- Índices Analíticos
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_timestamp ON orders(order_purchase_timestamp);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_category ON order_items(product_category);
```

---

## 🔒 Segurança & Controle de Origem de Dados

* **Seletor de Fonte (*Data Source Switcher*):**
  * `Demo 5.2k`: Processamento local na memória do navegador (latência 0ms).
  * `Supabase DB`: Consulta paginada via API REST direta ao servidor PostgreSQL na nuvem.
* **Gravação Administrativa Protegida:** O botão *"Salvar no Supabase"* realiza a sincronização limpa em lotes (*chunks de 500*) com validação por senha mestre configurável.
* **Row Level Security (RLS):** Tabelas protegidas com políticas de leitura e gravação auditadas.
* **Keep-Alive Protegido:** Endpoint de ping do banco com validação de token `CRON_SECRET`.

---

## ⚙️ Instalação e Execução Local

### 1. Clonar o repositório:
```bash
git clone https://github.com/samuelfrs/PulseMetrics.git
cd PulseMetrics
```

### 2. Instalar dependências:
```bash
npm install
```

### 3. Configurar variáveis de ambiente:
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Configure as chaves do seu projeto:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL da instância do Supabase (`https://<project-id>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |
| `NEXT_PUBLIC_ADMIN_SYNC_PASSWORD` | Senha administrativa para autorização de gravação no banco |
| `CRON_SECRET` | Token de segurança da rotina Vercel Cron (Keep-Alive) |

### 4. Rodar o servidor de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🚀 Deploy na Vercel

1. Faça o push do código para o seu repositório no **GitHub**.
2. Importe o projeto no painel da **[Vercel](https://vercel.com/)**.
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CRON_SECRET`, etc.) nas configurações de Environment Variables da Vercel.
4. Clique em **Deploy**!

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Desenvolvido com foco em excelência técnica, engenharia de dados e design de produto.
