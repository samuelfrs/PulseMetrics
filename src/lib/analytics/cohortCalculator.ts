import { Order, CohortRow, CohortCell } from '@/types/analytics';

export function calculateCohortMatrix(orders: Order[]): CohortRow[] {
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered');
  if (deliveredOrders.length === 0) return [];

  // 1. Identify first purchase month for each customer
  const customerFirstPurchase = new Map<string, Date>();

  deliveredOrders.forEach((order) => {
    const orderDate = new Date(order.order_purchase_timestamp);
    const existing = customerFirstPurchase.get(order.customer_id);
    if (!existing || orderDate < existing) {
      customerFirstPurchase.set(order.customer_id, orderDate);
    }
  });

  // Map: cohortKey (YYYY-MM) -> { size: number, customersInCohort: Set<string>, activityMonths: Map<number, Set<string>> }
  const cohortsMap = new Map<
    string,
    {
      cohortDate: Date;
      customers: Set<string>;
      months: Map<number, Set<string>>;
    }
  >();

  // Initialize cohorts
  customerFirstPurchase.forEach((firstDate, customerId) => {
    const cohortKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;
    if (!cohortsMap.has(cohortKey)) {
      cohortsMap.set(cohortKey, {
        cohortDate: new Date(firstDate.getFullYear(), firstDate.getMonth(), 1),
        customers: new Set(),
        months: new Map(),
      });
    }
    cohortsMap.get(cohortKey)!.customers.add(customerId);
  });

  // 2. Map all customer orders to month indices relative to their cohort
  deliveredOrders.forEach((order) => {
    const firstDate = customerFirstPurchase.get(order.customer_id);
    if (!firstDate) return;

    const cohortKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;
    const orderDate = new Date(order.order_purchase_timestamp);

    const monthDiff =
      (orderDate.getFullYear() - firstDate.getFullYear()) * 12 +
      (orderDate.getMonth() - firstDate.getMonth());

    if (monthDiff >= 0 && monthDiff <= 12) {
      const cohortData = cohortsMap.get(cohortKey);
      if (cohortData) {
        if (!cohortData.months.has(monthDiff)) {
          cohortData.months.set(monthDiff, new Set());
        }
        cohortData.months.get(monthDiff)!.add(order.customer_id);
      }
    }
  });

  // 3. Build formatted CohortRow array
  const result: CohortRow[] = [];
  const sortedCohortKeys = Array.from(cohortsMap.keys()).sort();

  sortedCohortKeys.forEach((cohortKey) => {
    const cohortData = cohortsMap.get(cohortKey)!;
    const cohortSize = cohortData.customers.size;
    if (cohortSize === 0) return;

    const cells: CohortCell[] = [];
    const maxMonths = 12;

    for (let m = 0; m < maxMonths; m++) {
      const activeCount = cohortData.months.get(m)?.size || 0;
      // If no activity and beyond current date, don't show or show 0
      const retentionRate = m === 0 ? 100 : Number(((activeCount / cohortSize) * 100).toFixed(1));

      cells.push({
        monthNumber: m,
        activeCustomers: activeCount,
        retentionRate: m === 0 ? 100 : retentionRate,
      });
    }

    result.push({
      cohortMonth: cohortKey,
      cohortSize,
      cells,
    });
  });

  return result;
}
