import { Order, KpiSummary, MonthlyKpi } from '@/types/analytics';

export function calculateExecutiveKpis(orders: Order[]): KpiSummary {
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered');
  if (deliveredOrders.length === 0) {
    return {
      totalGmv: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      activeCustomers: 0,
      repurchaseRate: 0,
      momGmvGrowth: 0,
      momOrdersGrowth: 0,
      monthlyHistory: [],
    };
  }

  // 1. Monthly Aggregation
  const monthMap = new Map<
    string,
    {
      gmv: number;
      orders: number;
      customers: Set<string>;
    }
  >();

  const customerOrderCounts = new Map<string, number>();

  deliveredOrders.forEach((order) => {
    const monthKey = order.order_purchase_timestamp.slice(0, 7); // YYYY-MM
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        gmv: 0,
        orders: 0,
        customers: new Set(),
      });
    }

    const currentMonth = monthMap.get(monthKey)!;
    currentMonth.gmv += Number(order.total_amount);
    currentMonth.orders += 1;
    currentMonth.customers.add(order.customer_id);

    customerOrderCounts.set(
      order.customer_id,
      (customerOrderCounts.get(order.customer_id) || 0) + 1
    );
  });

  // Sort months chronologically
  const sortedMonths = Array.from(monthMap.keys()).sort();

  // 2. Compute LAG() for MoM Growth
  const monthlyHistory: MonthlyKpi[] = [];
  let prevGmv: number | null = null;
  let prevOrders: number | null = null;

  sortedMonths.forEach((mKey) => {
    const data = monthMap.get(mKey)!;
    const gmv = Number(data.gmv.toFixed(2));
    const totalOrders = data.orders;
    const activeCustomers = data.customers.size;
    const avgTicket = totalOrders > 0 ? Number((gmv / totalOrders).toFixed(2)) : 0;

    let gmvGrowth: number | null = null;
    let ordersGrowth: number | null = null;

    if (prevGmv !== null && prevGmv > 0) {
      gmvGrowth = Number((((gmv - prevGmv) / prevGmv) * 100).toFixed(1));
    }
    if (prevOrders !== null && prevOrders > 0) {
      ordersGrowth = Number((((totalOrders - prevOrders) / prevOrders) * 100).toFixed(1));
    }

    monthlyHistory.push({
      order_month: mKey,
      total_orders: totalOrders,
      active_customers: activeCustomers,
      gmv,
      average_order_value: avgTicket,
      gmv_growth_percent: gmvGrowth,
      orders_growth_percent: ordersGrowth,
    });

    prevGmv = gmv;
    prevOrders = totalOrders;
  });

  // 3. Overall Totals
  const totalGmv = Number(
    deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0).toFixed(2)
  );
  const totalOrders = deliveredOrders.length;
  const averageOrderValue = totalOrders > 0 ? Number((totalGmv / totalOrders).toFixed(2)) : 0;
  const activeCustomers = customerOrderCounts.size;

  // Repurchase rate: customers with 2+ orders / total unique customers
  let repeatCustomers = 0;
  customerOrderCounts.forEach((count) => {
    if (count > 1) repeatCustomers += 1;
  });
  const repurchaseRate =
    activeCustomers > 0 ? Number(((repeatCustomers / activeCustomers) * 100).toFixed(1)) : 0;

  // Recent MoM (comparing last month to previous month)
  const lastIndex = monthlyHistory.length - 1;
  const momGmvGrowth = lastIndex >= 0 ? monthlyHistory[lastIndex].gmv_growth_percent || 0 : 0;
  const momOrdersGrowth =
    lastIndex >= 0 ? monthlyHistory[lastIndex].orders_growth_percent || 0 : 0;

  return {
    totalGmv,
    totalOrders,
    averageOrderValue,
    activeCustomers,
    repurchaseRate,
    momGmvGrowth,
    momOrdersGrowth,
    monthlyHistory,
  };
}
