'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Customer, Order, OrderItem, KpiSummary, CohortRow, RfmCustomer, RfmSegmentStats, ForecastSummary } from '@/types/analytics';
import { getDemoDataset } from '@/lib/demoData';
import { calculateExecutiveKpis } from '@/lib/analytics/kpiCalculator';
import { calculateCohortMatrix } from '@/lib/analytics/cohortCalculator';
import { calculateRfm } from '@/lib/analytics/rfmEngine';
import { calculateRevenueForecast } from '@/lib/analytics/linearRegression';
import { supabase } from '@/lib/supabase/client';

export type DataSourceType = 'demo' | 'csv' | 'supabase';

interface DataContextType {
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  isLoading: boolean;
  customers: Customer[];
  orders: Order[];
  items: OrderItem[];
  filteredOrders: Order[];
  dateRange: { start: string | null; end: string | null };
  setDateRange: (range: { start: string | null; end: string | null }) => void;
  selectedState: string | 'ALL';
  setSelectedState: (state: string | 'ALL') => void;
  
  // Analytics
  kpis: KpiSummary;
  cohortMatrix: CohortRow[];
  rfmCustomers: RfmCustomer[];
  rfmSegments: RfmSegmentStats[];
  forecast: ForecastSummary;
  categoryDistribution: { name: string; value: number; count: number }[];
  
  // Actions
  loadDemoData: () => void;
  loadCsvData: (importedCustomers: Customer[], importedOrders: Order[], importedItems?: OrderItem[]) => void;
  fetchSupabaseData: () => Promise<boolean>;
  syncCurrentDataToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;
  
  // Modal Inspect SQL
  inspectQueryId: string | null;
  openSqlInspector: (queryId: string) => void;
  closeSqlInspector: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSource] = useState<DataSourceType>('demo');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [selectedState, setSelectedState] = useState<string | 'ALL'>('ALL');
  const [inspectQueryId, setInspectQueryId] = useState<string | null>(null);

  // Initialize with synthetic demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setIsLoading(true);
    try {
      const demo = getDemoDataset();
      setCustomers(demo.customers);
      setOrders(demo.orders);
      setItems(demo.items);
      setDataSource('demo');
    } catch (e) {
      console.error('Error loading demo data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCsvData = (
    importedCustomers: Customer[],
    importedOrders: Order[],
    importedItems: OrderItem[] = []
  ) => {
    setIsLoading(true);
    setCustomers(importedCustomers);
    setOrders(importedOrders);
    setItems(importedItems);
    setDataSource('csv');
    setIsLoading(false);
  };

  const fetchSupabaseData = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Helper para buscar todas as páginas (Supera o limite de 1000 linhas do PostgREST)
      const fetchAllTableRows = async (tableName: string, orderCol?: string) => {
        let allRows: any[] = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let query = supabase.from(tableName).select('*').range(from, from + pageSize - 1);
          if (orderCol) {
            query = query.order(orderCol, { ascending: true });
          }
          const { data, error } = await query;
          if (error || !data || data.length === 0) {
            break;
          }
          allRows = allRows.concat(data);
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            from += pageSize;
          }
        }
        return allRows;
      };

      const [dbOrders, dbCustomers, dbItems] = await Promise.all([
        fetchAllTableRows('orders', 'order_purchase_timestamp'),
        fetchAllTableRows('customers'),
        fetchAllTableRows('order_items'),
      ]);

      if (dbOrders.length === 0) {
        setIsLoading(false);
        return false;
      }

      setOrders(dbOrders as Order[]);
      setCustomers(dbCustomers as Customer[]);
      setItems(dbItems as OrderItem[]);
      setDataSource('supabase');
      setIsLoading(false);
      return true;
    } catch (e) {
      console.error('Error fetching Supabase data:', e);
      setIsLoading(false);
      return false;
    }
  };

  const syncCurrentDataToSupabase = async () => {
    try {
      setIsLoading(true);

      // 1. Limpa registros anteriores para refletir exatamente o dataset ativo
      await supabase.from('order_items').delete().neq('order_item_id', '___NEVER___');
      await supabase.from('orders').delete().neq('order_id', '___NEVER___');
      await supabase.from('customers').delete().neq('customer_id', '___NEVER___');

      // 2. Gravação de Clientes em chunks de 500
      const customerPayload = customers.map((c) => ({
        customer_id: c.customer_id,
        customer_name: c.customer_name,
        customer_email: c.customer_email || null,
        customer_state: c.customer_state,
        created_at: c.created_at,
      }));

      for (let i = 0; i < customerPayload.length; i += 500) {
        const chunk = customerPayload.slice(i, i + 500);
        await supabase.from('customers').insert(chunk);
      }

      // 3. Gravação de Pedidos em chunks de 500
      const orderPayload = orders.map((o) => ({
        order_id: o.order_id,
        customer_id: o.customer_id,
        order_status: o.order_status,
        order_purchase_timestamp: o.order_purchase_timestamp,
        total_amount: o.total_amount,
        payment_method: o.payment_method,
      }));

      for (let i = 0; i < orderPayload.length; i += 500) {
        const chunk = orderPayload.slice(i, i + 500);
        await supabase.from('orders').insert(chunk);
      }

      // 4. Gravação de Itens do Pedido em chunks de 500
      let itemsToInsert = items;
      if (itemsToInsert.length === 0 && orders.length > 0) {
        // Fallback: se não houver itens explícitos, criar 1 item por pedido
        itemsToInsert = orders.map((o, idx) => ({
          order_item_id: `ITEM-SYNC-${idx + 1}`,
          order_id: o.order_id,
          product_id: 'PROD-GENERIC',
          product_category: 'Geral',
          price: o.total_amount,
          freight_value: 0,
        }));
      }

      const itemPayload = itemsToInsert.map((it) => ({
        order_item_id: it.order_item_id,
        order_id: it.order_id,
        product_id: it.product_id,
        product_category: it.product_category,
        price: it.price,
        freight_value: it.freight_value || 0,
      }));

      for (let i = 0; i < itemPayload.length; i += 500) {
        const chunk = itemPayload.slice(i, i + 500);
        await supabase.from('order_items').insert(chunk);
      }

      setIsLoading(false);
      return { success: true, count: orders.length };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, count: 0, error: err?.message };
    }
  };

  // Filtered orders based on dateRange and selectedState
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (selectedState !== 'ALL' && order.customer_state !== selectedState) {
        return false;
      }
      if (dateRange.start && new Date(order.order_purchase_timestamp) < new Date(dateRange.start)) {
        return false;
      }
      if (dateRange.end && new Date(order.order_purchase_timestamp) > new Date(dateRange.end)) {
        return false;
      }
      return true;
    });
  }, [orders, selectedState, dateRange]);

  // Derived Analytics Memoization
  const kpis = useMemo(() => calculateExecutiveKpis(filteredOrders), [filteredOrders]);
  const cohortMatrix = useMemo(() => calculateCohortMatrix(filteredOrders), [filteredOrders]);
  const { customers: rfmCustomers, segments: rfmSegments } = useMemo(
    () => calculateRfm(filteredOrders),
    [filteredOrders]
  );
  const forecast = useMemo(() => calculateRevenueForecast(filteredOrders, 30), [filteredOrders]);

  // Category breakdown
  const categoryDistribution = useMemo(() => {
    const map = new Map<string, { value: number; count: number }>();
    
    // If items exist, aggregate by item category
    if (items.length > 0) {
      const orderSet = new Set(filteredOrders.map((o) => o.order_id));
      items.forEach((item) => {
        if (!orderSet.has(item.order_id)) return;
        const cat = item.product_category || 'Geral';
        const current = map.get(cat) || { value: 0, count: 0 };
        map.set(cat, {
          value: current.value + Number(item.price),
          count: current.count + 1,
        });
      });
    } else {
      // Fallback
      map.set('Geral', {
        value: filteredOrders.reduce((s, o) => s + Number(o.total_amount), 0),
        count: filteredOrders.length,
      });
    }

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      value: Number(data.value.toFixed(2)),
      count: data.count,
    }));
  }, [filteredOrders, items]);

  const openSqlInspector = (queryId: string) => setInspectQueryId(queryId);
  const closeSqlInspector = () => setInspectQueryId(null);

  return (
    <DataContext.Provider
      value={{
        dataSource,
        setDataSource,
        isLoading,
        customers,
        orders,
        items,
        filteredOrders,
        dateRange,
        setDateRange,
        selectedState,
        setSelectedState,
        kpis,
        cohortMatrix,
        rfmCustomers,
        rfmSegments,
        forecast,
        categoryDistribution,
        loadDemoData,
        loadCsvData,
        fetchSupabaseData,
        syncCurrentDataToSupabase,
        inspectQueryId,
        openSqlInspector,
        closeSqlInspector,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
