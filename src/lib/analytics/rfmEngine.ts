import { Order, RfmCustomer, RfmSegment, RfmSegmentStats } from '@/types/analytics';

export function calculateRfm(
  orders: Order[],
  referenceDate: Date = new Date()
): {
  customers: RfmCustomer[];
  segments: RfmSegmentStats[];
} {
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered');
  if (deliveredOrders.length === 0) return { customers: [], segments: [] };

  // 1. Group by customer
  const customerMap = new Map<
    string,
    {
      name: string;
      state: string;
      lastDate: Date;
      frequency: number;
      monetary: number;
    }
  >();

  deliveredOrders.forEach((order) => {
    const existing = customerMap.get(order.customer_id);
    const orderDate = new Date(order.order_purchase_timestamp);

    if (!existing) {
      customerMap.set(order.customer_id, {
        name: order.customer_name || `Cliente ${order.customer_id.slice(-4)}`,
        state: order.customer_state || 'SP',
        lastDate: orderDate,
        frequency: 1,
        monetary: Number(order.total_amount),
      });
    } else {
      if (orderDate > existing.lastDate) {
        existing.lastDate = orderDate;
      }
      existing.frequency += 1;
      existing.monetary += Number(order.total_amount);
    }
  });

  // Calculate raw metrics
  const rawList = Array.from(customerMap.entries()).map(([customerId, data]) => {
    const diffMs = referenceDate.getTime() - data.lastDate.getTime();
    const recencyDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return {
      customerId,
      name: data.name,
      state: data.state,
      lastDate: data.lastDate.toISOString(),
      recencyDays,
      frequency: data.frequency,
      monetary: Number(data.monetary.toFixed(2)),
    };
  });

  const total = rawList.length;
  if (total === 0) return { customers: [], segments: [] };

  // 2. Rank and assign NTILE(5) scores
  // Recency: lower days is better -> score 5 for lowest recency
  const sortedByRecency = [...rawList].sort((a, b) => a.recencyDays - b.recencyDays);
  const rScoreMap = new Map<string, number>();
  sortedByRecency.forEach((item, index) => {
    // 5 = top 20% most recent
    const score = 5 - Math.min(4, Math.floor((index / total) * 5));
    rScoreMap.set(item.customerId, score);
  });

  // Frequency: higher orders is better -> score 5 for highest frequency
  const sortedByFreq = [...rawList].sort((a, b) => b.frequency - a.frequency);
  const fScoreMap = new Map<string, number>();
  sortedByFreq.forEach((item, index) => {
    const score = 5 - Math.min(4, Math.floor((index / total) * 5));
    fScoreMap.set(item.customerId, score);
  });

  // Monetary: higher money is better -> score 5 for highest spend
  const sortedByMonetary = [...rawList].sort((a, b) => b.monetary - a.monetary);
  const mScoreMap = new Map<string, number>();
  sortedByMonetary.forEach((item, index) => {
    const score = 5 - Math.min(4, Math.floor((index / total) * 5));
    mScoreMap.set(item.customerId, score);
  });

  // 3. Classify into segments
  const customers: RfmCustomer[] = rawList.map((item) => {
    const r = rScoreMap.get(item.customerId) || 3;
    const f = fScoreMap.get(item.customerId) || 3;
    const m = mScoreMap.get(item.customerId) || 3;

    let segment: RfmSegment = 'Lost / Low Value';

    if (r >= 4 && f >= 4 && m >= 4) {
      segment = 'Champions';
    } else if (r >= 3 && f >= 3 && m >= 3) {
      segment = 'Loyal Customers';
    } else if (r >= 4 && f <= 2) {
      segment = 'New Promising Customers';
    } else if (r >= 3 && f >= 2) {
      segment = 'Potential Loyalists';
    } else if (r <= 2 && (f >= 3 || m >= 3)) {
      segment = 'At Risk / Churn Alert';
    } else if (r <= 2 && f <= 2 && m >= 2) {
      segment = 'Hibernating / Cold';
    } else {
      segment = 'Lost / Low Value';
    }

    return {
      customer_id: item.customerId,
      customer_name: item.name,
      customer_state: item.state,
      recency_days: item.recencyDays,
      frequency: item.frequency,
      monetary: item.monetary,
      r_score: r,
      f_score: f,
      m_score: m,
      rfm_score_combined: `${r}${f}${m}`,
      segment,
      last_purchase_date: item.lastDate,
    };
  });

  // 4. Calculate Segment Aggregations
  const segmentDefinitions: {
    segment: RfmSegment;
    color: string;
    recommendation: string;
  }[] = [
    {
      segment: 'Champions',
      color: '#10b981', // Emerald 500
      recommendation: 'Ofereça programas VIP, acesso antecipado a lançamentos e recompensas de fidelidade exclusivas.',
    },
    {
      segment: 'Loyal Customers',
      color: '#3b82f6', // Blue 500
      recommendation: 'Faça cross-selling de produtos complementares e peça avaliações/depoimentos.',
    },
    {
      segment: 'Potential Loyalists',
      color: '#06b6d4', // Cyan 500
      recommendation: 'Ofereça recomendações personalizadas de upsell e incentivos para a 2ª ou 3ª compra.',
    },
    {
      segment: 'New Promising Customers',
      color: '#8b5cf6', // Purple/Indigo 500
      recommendation: 'Construa um fluxo de onboarding acolhedor e ofereça cupons com validade curta para recompra rápida.',
    },
    {
      segment: 'At Risk / Churn Alert',
      color: '#f59e0b', // Amber 500
      recommendation: 'Envie campanhas de reengajamento personalizadas com ofertas imperdíveis de "Sentimos sua falta".',
    },
    {
      segment: 'Hibernating / Cold',
      color: '#f97316', // Orange 500
      recommendation: 'Ofereça descontos agressivos em produtos mais vendidos para reativar o interesse de compra.',
    },
    {
      segment: 'Lost / Low Value',
      color: '#64748b', // Slate 500
      recommendation: 'Não gaste verba pesada de mídia paga; mantenha em automações de e-mail de baixo custo.',
    },
  ];

  const totalRevenueAll = customers.reduce((sum, c) => sum + c.monetary, 0);

  const segments: RfmSegmentStats[] = segmentDefinitions.map((def) => {
    const segCustomers = customers.filter((c) => c.segment === def.segment);
    const count = segCustomers.length;
    const rev = segCustomers.reduce((sum, c) => sum + c.monetary, 0);
    const avgTicket = count > 0 ? Number((rev / count).toFixed(2)) : 0;
    const avgFreq = count > 0 ? Number((segCustomers.reduce((sum, c) => sum + c.frequency, 0) / count).toFixed(1)) : 0;
    const avgRec = count > 0 ? Math.round(segCustomers.reduce((sum, c) => sum + c.recency_days, 0) / count) : 0;

    return {
      segment: def.segment,
      customerCount: count,
      percentageOfCustomers: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      totalRevenue: Number(rev.toFixed(2)),
      percentageOfRevenue: totalRevenueAll > 0 ? Number(((rev / totalRevenueAll) * 100).toFixed(1)) : 0,
      avgOrderValue: avgTicket,
      avgFrequency: avgFreq,
      avgRecencyDays: avgRec,
      actionRecommendation: def.recommendation,
      color: def.color,
    };
  });

  return { customers, segments };
}
