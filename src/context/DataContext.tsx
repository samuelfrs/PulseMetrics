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
      const { data: dbOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('order_purchase_timestamp', { ascending: true })
        .limit(10000);

      if (ordersError || !dbOrders || dbOrders.length === 0) {
        setIsLoading(false);
        return false;
      }

      const { data: dbCustomers } = await supabase.from('customers').select('*');
      const { data: dbItems } = await supabase.from('order_items').select('*');

      setOrders(dbOrders as Order[]);
      setCustomers((dbCustomers || []) as Customer[]);
      setItems((dbItems || []) as OrderItem[]);
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
      // Batch upsert customers
      if (customers.length > 0) {
        const customerBatches = customers.slice(0, 1000);
        await supabase.from('customers').upsert(customerBatches, { onConflict: 'customer_id' });
      }

      // Batch upsert orders
      if (orders.length > 0) {
        const orderBatches = orders.slice(0, 1000).map((o) => ({
          order_id: o.order_id,
          customer_id: o.customer_id,
          order_status: o.order_status,
          order_purchase_timestamp: o.order_purchase_timestamp,
          total_amount: o.total_amount,
          payment_method: o.payment_method,
        }));
        await supabase.from('orders').upsert(orderBatches, { onConflict: 'order_id' });
      }

      setIsLoading(false);
      return { success: true, count: Math.min(orders.length, 1000) };
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
