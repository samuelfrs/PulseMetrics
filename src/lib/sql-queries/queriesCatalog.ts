import { SqlQueryCatalogItem } from '@/types/analytics';

export const SQL_QUERIES_CATALOG: Record<string, SqlQueryCatalogItem> = {
  kpi_mom_growth: {
    id: 'kpi_mom_growth',
    title: 'KPIs Executivos & Variação Mês a Mês (MoM Growth)',
    category: 'kpi',
    complexity: 'Intermediário',
    keyFeatures: ['Common Table Expressions (CTE)', 'Window Function LAG()', 'Tratamento de divisão por zero (NULLIF)'],
    businessRationale:
      'Monitora o crescimento contínuo da receita (GMV) e do volume de pedidos, calculando automaticamente a aceleração ou desaceleração percentual em relação ao mês anterior.',
    statisticalConcept:
      'Variação Percentual = ((Mês_Atual - Mês_Anterior) / Mês_Anterior) * 100. A função LAG(gmv, 1) busca o valor da linha imediatamente anterior na série temporal ordenada.',
    sqlCode: `WITH monthly_metrics AS (
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
    active_customers,
    gmv,
    average_order_value,
    -- Cálculo da variação percentual de receita mês a mês (MoM Growth)
    ROUND(
        ((gmv - LAG(gmv) OVER (ORDER BY order_month)) / 
        NULLIF(LAG(gmv) OVER (ORDER BY order_month), 0)) * 100, 
        2
    ) AS gmv_growth_percent,
    -- Variação percentual do volume de pedidos
    ROUND(
        ((total_orders - LAG(total_orders) OVER (ORDER BY order_month))::NUMERIC / 
        NULLIF(LAG(total_orders) OVER (ORDER BY order_month), 0)) * 100, 
        2
    ) AS orders_growth_percent
FROM monthly_metrics
ORDER BY order_month DESC;`,
  },

  cohort_retention_matrix: {
    id: 'cohort_retention_matrix',
    title: 'Matriz de Retenção por Coortes (Cohort Retention Matrix)',
    category: 'cohort',
    complexity: 'Avançado',
    keyFeatures: ['Multi-level CTEs', 'Date Arithmetic & Difference', 'Group Aggregations', 'Retention Rate Formula'],
    businessRationale:
      'Identifica a "saúde" do ciclo de vida dos clientes. Permite diagnosticar se novas safras de clientes continuam comprando ao longo dos meses ou se a empresa sofre com churn prematuro.',
    statisticalConcept:
      'Uma Coorte agrupa clientes pelo mês da sua 1ª transação. O índice month_number (0 a 12) calcula quantos meses após a entrada o cliente continuou ativo. Taxa de Retenção = (Clientes Ativos no Mês N / Total Inicial da Coorte no Mês 0) * 100.',
    sqlCode: `WITH first_purchase AS (
    -- 1. Identifica o mês da primeira compra de cada cliente (Safra / Coorte)
    SELECT 
        customer_id,
        DATE_TRUNC('month', MIN(order_purchase_timestamp)) AS cohort_month
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY customer_id
),
customer_activities AS (
    -- 2. Mapeia todas as compras e calcula a distância em meses até a coorte de origem
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
    -- 3. Tamanho total inicial de cada coorte (Mês 0)
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
ORDER BY ca.cohort_month ASC, ca.month_number ASC;`,
  },

  rfm_segmentation: {
    id: 'rfm_segmentation',
    title: 'Algoritmo de Segmentação RFM (Recência, Frequência, Valor)',
    category: 'rfm',
    complexity: 'Avançado',
    keyFeatures: ['Window Function NTILE(5)', 'Date Difference', 'Clustering Rules (CASE WHEN)'],
    businessRationale:
      'Divide a base de clientes em 7 clusters acionáveis (Champions, Loyal, At Risk, Novos Promissores, etc.), permitindo direcionar verba de marketing e campanhas de retenção personalizadas.',
    statisticalConcept:
      'Atribui notas de 1 a 5 para Recência (dias desde a última compra), Frequência (total de compras) e Valor Monetário (total gasto) usando NTILE(5) sobre a distribuição percentilar.',
    sqlCode: `WITH customer_rfm_raw AS (
    SELECT 
        o.customer_id,
        c.customer_name,
        c.customer_state,
        -- Recência: Dias desde a última compra até hoje
        DATE_PART('day', CURRENT_TIMESTAMP - MAX(o.order_purchase_timestamp)) AS recency_days,
        -- Frequência: Total de pedidos entregues
        COUNT(DISTINCT o.order_id) AS frequency,
        -- Valor: Total gasto na plataforma
        SUM(o.total_amount) AS monetary
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_status = 'delivered'
    GROUP BY o.customer_id, c.customer_name, c.customer_state
),
rfm_scores AS (
    SELECT 
        customer_id,
        customer_name,
        customer_state,
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
    customer_name,
    customer_state,
    recency_days,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    CONCAT(r_score, f_score, m_score) AS rfm_score_combined,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 4 AND f_score <= 2 THEN 'New Promising Customers'
        WHEN r_score >= 3 AND f_score >= 2 THEN 'Potential Loyalists'
        WHEN r_score <= 2 AND (f_score >= 3 OR m_score >= 3) THEN 'At Risk / Churn Alert'
        WHEN r_score <= 2 AND f_score <= 2 AND m_score >= 2 THEN 'Hibernating / Cold'
        ELSE 'Lost / Low Value'
    END AS segment_label
FROM rfm_scores
ORDER BY monetary DESC;`,
  },

  revenue_forecasting: {
    id: 'revenue_forecasting',
    title: 'Projeção de Tendência Linear & Média Móvel (Forecasting)',
    category: 'forecasting',
    complexity: 'Expert',
    keyFeatures: ['Ordinary Least Squares (OLS) em SQL', 'Linear Regression Slope & Intercept', 'Moving Average Window'],
    businessRationale:
      'Estima o faturamento futuro dos próximos 30 a 60 dias através do ajuste linear de mínimos quadrados sobre a série temporal de vendas.',
    statisticalConcept:
      'Calcula Slope (m) = [N*Σ(xy) - Σx*Σy] / [N*Σ(x²) - (Σx)²] e Intercept (b) = (Σy - m*Σx)/N para derivar a reta ŷ = mx + b.',
    sqlCode: `WITH daily_sales AS (
    SELECT 
        DATE(order_purchase_timestamp) AS sale_date,
        SUM(total_amount) AS daily_gmv,
        ROW_NUMBER() OVER (ORDER BY DATE(order_purchase_timestamp)) - 1 AS x_index
    FROM orders
    WHERE order_status = 'delivered'
    GROUP BY DATE(order_purchase_timestamp)
),
stats AS (
    SELECT 
        COUNT(*) AS n,
        SUM(x_index) AS sum_x,
        SUM(daily_gmv) AS sum_y,
        SUM(x_index * daily_gmv) AS sum_xy,
        SUM(x_index * x_index) AS sum_x2
    FROM daily_sales
),
coefficients AS (
    SELECT 
        (n * sum_xy - sum_x * sum_y) / NULLIF(n * sum_x2 - sum_x * sum_x, 0) AS slope_m,
        (sum_y - ((n * sum_xy - sum_x * sum_y) / NULLIF(n * sum_x2 - sum_x * sum_x, 0)) * sum_x) / n AS intercept_b
    FROM stats
)
SELECT 
    d.sale_date,
    d.daily_gmv,
    -- Média móvel de 7 dias
    ROUND(AVG(d.daily_gmv) OVER (ORDER BY d.sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS moving_avg_7d,
    -- Valor ajustado pela regressão
    ROUND((c.slope_m * d.x_index + c.intercept_b), 2) AS regression_fitted_value
FROM daily_sales d
CROSS JOIN coefficients c
ORDER BY d.sale_date ASC;`,
  },

  category_revenue: {
    id: 'category_revenue',
    title: 'Performance & Distribuição por Categoria de Produto',
    category: 'kpi',
    complexity: 'Básico',
    keyFeatures: ['JOIN Multi-tabelas', 'Agregações Sum/Avg', 'Percentual sobre Total com Window SUM()'],
    businessRationale:
      'Permite entender quais categorias de produtos representam a maior fatia de receita e ticket médio no ecossistema de vendas.',
    statisticalConcept:
      'Agrupa os itens dos pedidos entregues e calcula o share relativo com SUM() OVER ().',
    sqlCode: `SELECT 
    oi.product_category,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.price) AS total_revenue,
    ROUND(AVG(oi.price), 2) AS avg_item_price,
    ROUND(
        (SUM(oi.price) / SUM(SUM(oi.price)) OVER ()) * 100, 
        2
    ) AS revenue_share_percentage
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status = 'delivered'
GROUP BY oi.product_category
ORDER BY total_revenue DESC;`,
  },

  order_items_join: {
    id: 'order_items_join',
    title: 'Detalhamento Completo de Pedido & Composição de Itens (JOIN 1:N)',
    category: 'kpi',
    complexity: 'Intermediário',
    keyFeatures: ['JOIN Relacional 1:N', 'Múltiplos Itens por Pedido', 'Filtro por ID de Pedido'],
    businessRationale:
      'Recupera a composição exata de um carrinho de compras: cliente, itens, categorias, valores unitários e valor total transacionado.',
    statisticalConcept:
      'Une as tabelas orders, customers e order_items via chaves estrangeiras (customer_id e order_id).',
    sqlCode: `SELECT 
    o.order_id,
    o.order_purchase_timestamp,
    o.order_status,
    o.payment_method,
    c.customer_id,
    c.customer_name,
    c.customer_state,
    oi.order_item_id,
    oi.product_id,
    oi.product_category,
    oi.price AS item_price,
    oi.freight_value,
    o.total_amount AS order_total_amount
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_id = 'CA-2016-152156'
ORDER BY oi.order_item_id ASC;`,
  },
};
