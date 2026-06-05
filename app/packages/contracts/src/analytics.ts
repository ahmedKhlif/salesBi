export interface MetricCard {
  id: string;
  title: string;
  value: string;
  rawValue: number;
  subtitle: string;
  trendLabel: string;
  trendDirection: "up" | "down" | "flat";
  trendValue: number;
  sparkline: number[];
}

export interface OverviewPayload {
  kpis: MetricCard[];
  insights: import("./api").Insight[];
  preview: TablePayload<Record<string, unknown>>;
}

export interface SeriesPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface BreakdownRow {
  id: string;
  label: string;
  metric: number;
  secondaryMetric?: number;
  tertiaryMetric?: number;
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface TablePayload<T extends Record<string, unknown>> {
  columns: TableColumn[];
  rows: T[];
}

export interface CalendarEventPayload {
  id: string;
  date: string;
  title: string;
  sales: number;
  quantity: number;
  discount: number;
  tax: number;
  level: "high" | "medium" | "low";
}

export interface ExplorerRow {
  fullDate: string;
  year: number;
  quarter: number;
  month: string;
  productId: number;
  productName: string;
  customerId: number;
  customerName: string;
  city: string;
  salesRep: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  discountRate: number;
  taxAmount: number;
  totalSales: number;
  netSalesWithoutTax: number;
  orderStatus: string;
  paymentStatus: string;
}
