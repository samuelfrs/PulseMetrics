-- ==============================================================================
-- PULSEMETRICS - BANCO DE DADOS ANALÍTICO (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_state VARCHAR(2), -- 'SP', 'RJ', 'MG', 'CE', 'RS', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_status VARCHAR(20) NOT NULL DEFAULT 'delivered', -- 'delivered', 'canceled', 'shipped'
    order_purchase_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'credit_card' -- 'credit_card', 'pix', 'boleto', 'voucher'
);

-- 3. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_category VARCHAR(50) NOT NULL, -- 'Eletrônicos', 'Vestuário', 'Casa', etc.
    price NUMERIC(10, 2) NOT NULL,
    freight_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- ÍNDICES ANALÍTICOS PARA ALTA VELOCIDADE EM QUERIES
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(order_purchase_timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_category ON order_items(product_category);

-- HABILITAR RLS (ROW LEVEL SECURITY)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (PÚBLICO LEITURA E INSERÇÃO)
CREATE POLICY IF NOT EXISTS "Allow public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
