export type OrderStatus = 'delivered' | 'canceled' | 'shipped' | 'processing';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'voucher';

export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_state: string;
  created_at: string;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  product_category: string;
  price: number;
  freight_value: number;
}

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name?: string;
  customer_state?: string;
  order_status: OrderStatus;
  order_purchase_timestamp: string; // ISO string
  total_amount: number;
  payment_method: PaymentMethod;
  items?: OrderItem[];
}

export interface RawTransactionRow {
  order_id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_state?: string;
  order_status?: string;
  order_date?: string;
  timestamp?: string;
  total_amount?: string | number;
  value?: string | number;
  payment_method?: string;
  category?: string;
  [key: string]: any;
}

export interface MonthlyKpi {
  order_month: string; // YYYY-MM
  total_orders: number;
  active_customers: number;
  gmv: number;
  average_order_value: number;
  gmv_growth_percent: number | null;
  orders_growth_percent: number | null;
}

export interface KpiSummary {
  totalGmv: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  repurchaseRate: number;
  momGmvGrowth: number;
  momOrdersGrowth: number;
  monthlyHistory: MonthlyKpi[];
}

export interface CohortCell {
  monthNumber: number; // 0, 1, 2, ...
  activeCustomers: number;
  retentionRate: number; // 0 to 100
}

export interface CohortRow {
  cohortMonth: string; // YYYY-MM
  cohortSize: number;
  cells: CohortCell[];
}

export type RfmSegment =
  | 'Champions'
  | 'Loyal Customers'
  | 'Potential Loyalists'
  | 'New Promising Customers'
  | 'At Risk / Churn Alert'
  | 'Hibernating / Cold'
  | 'Lost / Low Value';

export interface RfmCustomer {
  customer_id: string;
  customer_name: string;
  customer_state: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  r_score: number; // 1-5
  f_score: number; // 1-5
  m_score: number; // 1-5
  rfm_score_combined: string; // e.g. "555", "342"
  segment: RfmSegment;
  last_purchase_date: string;
}

export interface RfmSegmentStats {
  segment: RfmSegment;
  customerCount: number;
  percentageOfCustomers: number;
  totalRevenue: number;
  percentageOfRevenue: number;
  avgOrderValue: number;
  avgFrequency: number;
  avgRecencyDays: number;
  actionRecommendation: string;
  color: string;
}

export interface ForecastDataPoint {
  date: string;
  actualGmv?: number;
  forecastGmv?: number;
  lowerBound?: number;
  upperBound?: number;
  movingAverage7d?: number;
  isProjected: boolean;
}

export interface ForecastSummary {
  historicalData: ForecastDataPoint[];
  projectedData: ForecastDataPoint[];
  slope: number;
  intercept: number;
  rSquared: number;
  expectedNext30dRevenue: number;
  growthRateExpectedPercent: number;
}

export interface SqlQueryCatalogItem {
  id: string;
  title: string;
  category: 'kpi' | 'cohort' | 'rfm' | 'forecasting' | 'ingestion';
  businessRationale: string;
  statisticalConcept: string;
  sqlCode: string;
  complexity: 'Básico' | 'Intermediário' | 'Avançado' | 'Expert';
  keyFeatures: string[];
}
