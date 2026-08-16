import { Order, ForecastDataPoint, ForecastSummary } from '@/types/analytics';

export function calculateRevenueForecast(
  orders: Order[],
  forecastDays: number = 30
): ForecastSummary {
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered');
  if (deliveredOrders.length === 0) {
    return {
      historicalData: [],
      projectedData: [],
      slope: 0,
      intercept: 0,
      rSquared: 0,
      expectedNext30dRevenue: 0,
      growthRateExpectedPercent: 0,
    };
  }

  // 1. Group revenue by day
  const dailyMap = new Map<string, number>();
  deliveredOrders.forEach((order) => {
    const day = order.order_purchase_timestamp.slice(0, 10); // YYYY-MM-DD
    dailyMap.set(day, (dailyMap.get(day) || 0) + Number(order.total_amount));
  });

  const sortedDays = Array.from(dailyMap.keys()).sort();
  if (sortedDays.length < 2) {
    return {
      historicalData: [],
      projectedData: [],
      slope: 0,
      intercept: 0,
      rSquared: 0,
      expectedNext30dRevenue: 0,
      growthRateExpectedPercent: 0,
    };
  }

  // Take the last 180 days max for accurate local trend modeling
  const recentDays = sortedDays.slice(-180);

  // 2. Linear Regression (OLS)
  // X = day index (0, 1, 2, ... N-1), Y = daily GMV
  const n = recentDays.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  const yValues: number[] = [];

  recentDays.forEach((day, index) => {
    const y = dailyMap.get(day) || 0;
    yValues.push(y);
    const x = index;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  recentDays.forEach((_, index) => {
    const y = yValues[index];
    const yPred = slope * index + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - yPred, 2);
  });
  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;

  // Standard error of estimate for confidence bounds
  const stdError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 50;

  // 3. Build Historical Points with 7-Day Moving Average
  const historicalData: ForecastDataPoint[] = [];

  recentDays.forEach((day, index) => {
    // 7-day moving average
    const windowStart = Math.max(0, index - 6);
    const slice = yValues.slice(windowStart, index + 1);
    const movingAvg = slice.reduce((a, b) => a + b, 0) / slice.length;

    historicalData.push({
      date: day,
      actualGmv: Number(yValues[index].toFixed(2)),
      forecastGmv: Number(Math.max(0, slope * index + intercept).toFixed(2)),
      movingAverage7d: Number(movingAvg.toFixed(2)),
      isProjected: false,
    });
  });

  // 4. Generate Future Projected Points
  const projectedData: ForecastDataPoint[] = [];
  const lastDate = new Date(recentDays[recentDays.length - 1]);
  let cumulativeProjected30d = 0;

  for (let i = 1; i <= forecastDays; i++) {
    const nextDate = new Date(lastDate.getTime() + i * 86400000);
    const nextDateStr = nextDate.toISOString().slice(0, 10);
    const x = n - 1 + i;
    const basePrediction = Math.max(0, slope * x + intercept);

    // Day of week seasonality adjustment (weekends vs weekdays)
    const dayOfWeek = nextDate.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.88 : 1.05;
    const adjustedPrediction = Number((basePrediction * weekendMultiplier).toFixed(2));

    // Confidence interval expands as we project further into the future
    const uncertaintyMultiplier = 1.96 * stdError * Math.sqrt(1 + 1 / n + Math.pow(x - sumX / n, 2) / sumX2);
    const lower = Math.max(0, Number((adjustedPrediction - uncertaintyMultiplier).toFixed(2)));
    const upper = Number((adjustedPrediction + uncertaintyMultiplier).toFixed(2));

    if (i <= 30) {
      cumulativeProjected30d += adjustedPrediction;
    }

    projectedData.push({
      date: nextDateStr,
      forecastGmv: adjustedPrediction,
      lowerBound: lower,
      upperBound: upper,
      isProjected: true,
    });
  }

  // Calculate past 30 days revenue for growth comparison
  const past30dRevenue = yValues.slice(-30).reduce((a, b) => a + b, 0);
  const growthRate =
    past30dRevenue > 0
      ? Number((((cumulativeProjected30d - past30dRevenue) / past30dRevenue) * 100).toFixed(1))
      : 0;

  return {
    historicalData,
    projectedData,
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(2)),
    rSquared: Number(rSquared.toFixed(3)),
    expectedNext30dRevenue: Number(cumulativeProjected30d.toFixed(2)),
    growthRateExpectedPercent: growthRate,
  };
}
