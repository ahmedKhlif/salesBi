import type {
  BreakdownRow,
  CalendarEventPayload,
  ExplorerRow,
  Insight,
  MetricCard,
  SeriesPoint,
  TablePayload,
} from '@saleslens/contracts';
import type { GlobalFiltersDto } from '../common/dto/global-filters.dto';
import type {
  MockCustomer,
  MockProduct,
  MockSaleLine,
  MockSalesRep,
  WarehouseData,
} from '../common/types/domain';

export interface Summary {
  totalSales: number;
  totalQuantitySold: number;
  totalDiscount: number;
  totalTax: number;
  numberOfSalesLines: number;
  netSalesWithoutTax: number;
  discountRate: number;
  averageUnitPrice: number;
  averageSalesAmount: number;
  averageTaxPerSalesLine: number;
}

type Grain = 'year' | 'quarter' | 'month' | 'day';
type MetricKey = keyof Summary;
type DimensionKey =
  | 'product'
  | 'customer'
  | 'city'
  | 'customerStatus'
  | 'customerType'
  | 'salesRep'
  | 'paymentTerms';

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function toMap<T, K extends keyof T>(items: T[], key: K) {
  return new Map(items.map((item) => [String(item[key]), item] as const));
}

function summarize(lines: MockSaleLine[]): Summary {
  const totalSales = round(
    lines.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const totalQuantitySold = round(
    lines.reduce((sum, item) => sum + item.quantity, 0),
  );
  const totalDiscount = round(
    lines.reduce((sum, item) => sum + item.discountAmount, 0),
  );
  const totalTax = round(lines.reduce((sum, item) => sum + item.taxAmount, 0));
  const numberOfSalesLines = lines.length;
  const netSalesWithoutTax = round(
    lines.reduce((sum, item) => sum + item.netSalesWithoutTax, 0),
  );
  const grossBeforeDiscount = totalSales + totalDiscount;
  return {
    totalSales,
    totalQuantitySold,
    totalDiscount,
    totalTax,
    numberOfSalesLines,
    netSalesWithoutTax,
    discountRate:
      grossBeforeDiscount > 0 ? round(totalDiscount / grossBeforeDiscount) : 0,
    averageUnitPrice:
      totalQuantitySold > 0 ? round(totalSales / totalQuantitySold) : 0,
    averageSalesAmount:
      numberOfSalesLines > 0 ? round(totalSales / numberOfSalesLines) : 0,
    averageTaxPerSalesLine:
      numberOfSalesLines > 0 ? round(totalTax / numberOfSalesLines) : 0,
  };
}

function metricFromSummary(summary: Summary, metric: MetricKey) {
  return summary[metric];
}

function sortDesc(points: BreakdownRow[]) {
  return [...points].sort((left, right) => right.metric - left.metric);
}

export function applyFilters(
  warehouse: WarehouseData,
  filters: GlobalFiltersDto,
) {
  const customers = toMap(warehouse.customers, 'customerId');
  const products = toMap(warehouse.products, 'productId');
  const reps = toMap(warehouse.salesReps, 'employeeId');

  return warehouse.sales.filter((line) => {
    if (filters.fromDate && line.fullDate < filters.fromDate) return false;
    if (filters.toDate && line.fullDate > filters.toDate) return false;
    if (filters.year?.length && !filters.year.includes(line.year)) return false;
    if (filters.quarter?.length && !filters.quarter.includes(line.quarter))
      return false;
    if (filters.month?.length && !filters.month.includes(line.monthNumber))
      return false;
    if (
      filters.productId?.length &&
      !filters.productId.includes(line.productId)
    )
      return false;
    if (
      filters.customerId?.length &&
      !filters.customerId.includes(line.customerId)
    )
      return false;
    if (
      filters.salesRepId?.length &&
      !filters.salesRepId.includes(line.employeeId)
    )
      return false;
    if (
      filters.orderStatus?.length &&
      !filters.orderStatus.includes(line.orderStatus)
    )
      return false;
    if (
      filters.paymentStatus?.length &&
      !filters.paymentStatus.includes(line.paymentStatus)
    )
      return false;

    const customer = customers.get(String(line.customerId));
    if (!customer) return false;
    if (filters.city?.length && !filters.city.includes(customer.city))
      return false;
    if (
      filters.customerStatus?.length &&
      !filters.customerStatus.includes(customer.customerStatus)
    ) {
      return false;
    }

    return Boolean(
      products.get(String(line.productId)) && reps.get(String(line.employeeId)),
    );
  });
}

export function buildKpis(
  current: MockSaleLine[],
  previous: MockSaleLine[],
): MetricCard[] {
  const currentSummary = summarize(current);
  const previousSummary = summarize(previous);

  const metrics: Array<{
    id: string;
    title: string;
    subtitle: string;
    metric: MetricKey;
    format: (value: number) => string;
  }> = [
    {
      id: 'sales',
      title: 'Total Sales',
      subtitle: 'Revenue including tax',
      metric: 'totalSales',
      format: formatCurrency,
    },
    {
      id: 'net-sales',
      title: 'Net Sales Without Tax',
      subtitle: 'Net revenue',
      metric: 'netSalesWithoutTax',
      format: formatCurrency,
    },
    {
      id: 'quantity',
      title: 'Total Quantity Sold',
      subtitle: 'Units moved',
      metric: 'totalQuantitySold',
      format: (value) => value.toLocaleString(),
    },
    {
      id: 'lines',
      title: 'Number of Sales Lines',
      subtitle: 'Transactional depth',
      metric: 'numberOfSalesLines',
      format: (value) => value.toLocaleString(),
    },
    {
      id: 'avg-unit-price',
      title: 'Average Unit Price',
      subtitle: 'Pricing pulse',
      metric: 'averageUnitPrice',
      format: formatCurrency,
    },
    {
      id: 'avg-sales',
      title: 'Average Sales Amount',
      subtitle: 'Average line value',
      metric: 'averageSalesAmount',
      format: formatCurrency,
    },
    {
      id: 'discount',
      title: 'Total Discount',
      subtitle: 'Granted discounts',
      metric: 'totalDiscount',
      format: formatCurrency,
    },
    {
      id: 'discount-rate',
      title: 'Discount Rate',
      subtitle: 'Discount intensity',
      metric: 'discountRate',
      format: formatPercent,
    },
    {
      id: 'tax',
      title: 'Total Tax',
      subtitle: 'Collected tax',
      metric: 'totalTax',
      format: formatCurrency,
    },
    {
      id: 'avg-tax',
      title: 'Average Tax Per Sales Line',
      subtitle: 'Average tax burden',
      metric: 'averageTaxPerSalesLine',
      format: formatCurrency,
    },
  ];

  return metrics.map((item, index) => {
    const currentValue = metricFromSummary(currentSummary, item.metric);
    const previousValue = metricFromSummary(previousSummary, item.metric);
    const delta =
      previousValue === 0
        ? 0
        : round((currentValue - previousValue) / previousValue);
    return {
      id: item.id,
      title: item.title,
      value: item.format(currentValue),
      rawValue: currentValue,
      subtitle: item.subtitle,
      trendLabel: `vs previous period`,
      trendDirection: delta > 0.01 ? 'up' : delta < -0.01 ? 'down' : 'flat',
      trendValue: delta,
      sparkline: Array.from({ length: 6 }, (_, sparkIndex) =>
        round(currentValue * (0.78 + ((index + sparkIndex) % 5) * 0.05)),
      ),
    };
  });
}

export function buildInsights(
  warehouse: WarehouseData,
  current: MockSaleLine[],
  previous: MockSaleLine[],
): Insight[] {
  const currentSummary = summarize(current);
  const previousSummary = summarize(previous);
  const growth =
    previousSummary.totalSales === 0
      ? 0
      : round(
          (currentSummary.totalSales - previousSummary.totalSales) /
            previousSummary.totalSales,
        );

  const byProduct = buildBreakdown(
    warehouse,
    current,
    'product',
    'totalSales',
    1,
  )[0];
  const byCity = buildBreakdown(warehouse, current, 'city', 'totalSales', 1)[0];
  const byRep = buildBreakdown(
    warehouse,
    current,
    'salesRep',
    'totalSales',
    1,
  )[0];
  const byMonth = buildTrend(current, 'month', 'totalSales').sort(
    (a, b) => b.value - a.value,
  )[0];

  return [
    {
      id: 'best-product',
      title: 'Best Product',
      value: byProduct?.label ?? 'N/A',
      tone: 'positive',
      description: `${byProduct ? formatCurrency(byProduct.metric) : 'No data'} in sales.`,
    },
    {
      id: 'best-city',
      title: 'Best Sales City',
      value: byCity?.label ?? 'N/A',
      tone: 'positive',
      description: 'Leading market by sales volume.',
    },
    {
      id: 'best-rep',
      title: 'Best Sales Representative',
      value: byRep?.label ?? 'N/A',
      tone: 'positive',
      description: 'Top performer in the filtered scope.',
    },
    {
      id: 'best-month',
      title: 'Best Month',
      value: byMonth?.label ?? 'N/A',
      tone: 'neutral',
      description: `${byMonth ? formatCurrency(byMonth.value) : 'No sales'} recorded.`,
    },
    {
      id: 'growth',
      title: 'Sales Growth',
      value: formatPercent(growth),
      tone: growth >= 0 ? 'positive' : 'warning',
      description:
        growth >= 0
          ? 'Sales are trending upward.'
          : 'Sales are trailing the prior period.',
    },
    {
      id: 'discount-risk',
      title: 'Discount Watch',
      value: formatPercent(currentSummary.discountRate),
      tone: currentSummary.discountRate > 0.09 ? 'warning' : 'neutral',
      description:
        currentSummary.discountRate > 0.09
          ? 'Discount pressure is above the comfort zone.'
          : 'Discount level remains controlled.',
    },
  ];
}

export function buildTrend(
  lines: MockSaleLine[],
  grain: Grain,
  metric: MetricKey,
): SeriesPoint[] {
  const groups = new Map<string, MockSaleLine[]>();
  for (const line of lines) {
    const label =
      grain === 'year'
        ? String(line.year)
        : grain === 'quarter'
          ? `Q${line.quarter} ${line.year}`
          : grain === 'month'
            ? `${line.monthName} ${line.year}`
            : line.fullDate;
    groups.set(label, [...(groups.get(label) ?? []), line]);
  }

  return [...groups.entries()].map(([label, groupLines]) => {
    const summary = summarize(groupLines);
    return {
      label,
      value: metricFromSummary(summary, metric),
      secondaryValue:
        metric === 'totalSales' ? summary.totalDiscount : summary.totalTax,
    };
  });
}

export function buildBreakdown(
  warehouse: WarehouseData,
  lines: MockSaleLine[],
  dimension: DimensionKey,
  metric: MetricKey,
  limit = 10,
): BreakdownRow[] {
  const productMap = toMap(warehouse.products, 'productId');
  const customerMap = toMap(warehouse.customers, 'customerId');
  const repMap = toMap(warehouse.salesReps, 'employeeId');
  const groups = new Map<string, MockSaleLine[]>();

  for (const line of lines) {
    const customer = customerMap.get(String(line.customerId));
    const product = productMap.get(String(line.productId));
    const rep = repMap.get(String(line.employeeId));
    const label =
      dimension === 'product'
        ? product?.productName
        : dimension === 'customer'
          ? `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim()
          : dimension === 'city'
            ? customer?.city
            : dimension === 'customerStatus'
              ? customer?.customerStatus
              : dimension === 'customerType'
                ? customer?.customerType
                : dimension === 'salesRep'
                  ? `${rep?.firstName ?? ''} ${rep?.lastName ?? ''}`.trim()
                  : customer?.paymentTermsDays
                    ? `${customer.paymentTermsDays} days`
                    : 'Unknown';

    if (!label) {
      continue;
    }
    groups.set(label, [...(groups.get(label) ?? []), line]);
  }

  return sortDesc(
    [...groups.entries()].map(([label, groupLines], index) => {
      const summary = summarize(groupLines);
      return {
        id: `${dimension}-${index}-${label}`,
        label,
        metric: metricFromSummary(summary, metric),
        secondaryMetric: summary.totalQuantitySold,
        tertiaryMetric: summary.discountRate,
      };
    }),
  ).slice(0, limit);
}

export function buildPerformanceTable<
  T extends 'product' | 'customer' | 'salesRep',
>(
  warehouse: WarehouseData,
  lines: MockSaleLine[],
  entity: T,
): TablePayload<Record<string, unknown>> {
  const rows =
    entity === 'product'
      ? warehouse.products.map((product) => {
          const productLines = lines.filter(
            (line) => line.productId === product.productId,
          );
          const summary = summarize(productLines);
          return {
            productId: product.productId,
            productName: product.productName,
            standardCost: product.standardCost,
            listPrice: product.listPrice,
            estimatedMargin: round(product.listPrice - product.standardCost),
            totalSales: summary.totalSales,
            netSalesWithoutTax: summary.netSalesWithoutTax,
            totalQuantitySold: summary.totalQuantitySold,
            averageUnitPrice: summary.averageUnitPrice,
            totalDiscount: summary.totalDiscount,
            discountRate: summary.discountRate,
            totalTax: summary.totalTax,
            numberOfSalesLines: summary.numberOfSalesLines,
          };
        })
      : entity === 'customer'
        ? warehouse.customers.map((customer) => {
            const customerLines = lines.filter(
              (line) => line.customerId === customer.customerId,
            );
            const summary = summarize(customerLines);
            return {
              customerId: customer.customerId,
              customerCode: customer.customerCode,
              fullName: `${customer.firstName} ${customer.lastName}`,
              customerType: customer.customerType,
              city: customer.city,
              customerStatus: customer.customerStatus,
              paymentTermsDays: customer.paymentTermsDays,
              registrationDate: customer.registrationDate,
              totalSales: summary.totalSales,
              netSalesWithoutTax: summary.netSalesWithoutTax,
              totalQuantitySold: summary.totalQuantitySold,
              numberOfSalesLines: summary.numberOfSalesLines,
              averageSalesAmount: summary.averageSalesAmount,
              totalDiscount: summary.totalDiscount,
              discountRate: summary.discountRate,
            };
          })
        : warehouse.salesReps.map((rep) => {
            const repLines = lines.filter(
              (line) => line.employeeId === rep.employeeId,
            );
            const summary = summarize(repLines);
            return {
              employeeId: rep.employeeId,
              employeeCode: rep.employeeCode,
              fullName: `${rep.firstName} ${rep.lastName}`,
              email: rep.email,
              totalSales: summary.totalSales,
              netSalesWithoutTax: summary.netSalesWithoutTax,
              totalQuantitySold: summary.totalQuantitySold,
              numberOfSalesLines: summary.numberOfSalesLines,
              averageSalesAmount: summary.averageSalesAmount,
              totalDiscount: summary.totalDiscount,
              discountRate: summary.discountRate,
              totalTax: summary.totalTax,
            };
          });

  const columns = rows.length
    ? Object.keys(rows[0]).map((key) => ({ key, label: key }))
    : [];

  return {
    columns,
    rows: rows.filter((row) => Number(row.totalSales ?? 0) > 0),
  };
}

export function buildCalendarEvents(
  lines: MockSaleLine[],
): CalendarEventPayload[] {
  const daily = buildTrend(lines, 'day', 'totalSales');
  const values = daily.map((item) => item.value);
  const high = values.length ? Math.max(...values) * 0.75 : 0;
  const medium = values.length ? Math.max(...values) * 0.4 : 0;

  return daily.map((item, index) => ({
    id: `day-${index}`,
    date: item.label,
    title: `Sales: ${formatCurrency(item.value)}`,
    sales: item.value,
    quantity: 0,
    discount: 0,
    tax: 0,
    level:
      item.value >= high ? 'high' : item.value >= medium ? 'medium' : 'low',
  }));
}

export function buildExplorerRows(
  warehouse: WarehouseData,
  lines: MockSaleLine[],
): ExplorerRow[] {
  const productMap = toMap(warehouse.products, 'productId');
  const customerMap = toMap(warehouse.customers, 'customerId');
  const repMap = toMap(warehouse.salesReps, 'employeeId');

  return lines.map((line) => {
    const product = productMap.get(String(line.productId)) as MockProduct;
    const customer = customerMap.get(String(line.customerId)) as MockCustomer;
    const rep = repMap.get(String(line.employeeId)) as MockSalesRep;
    return {
      fullDate: line.fullDate,
      year: line.year,
      quarter: line.quarter,
      month: line.monthName,
      productId: line.productId,
      productName: product.productName,
      customerId: line.customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      city: customer.city,
      salesRep: `${rep.firstName} ${rep.lastName}`,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountAmount: line.discountAmount,
      discountRate:
        line.lineTotal + line.discountAmount > 0
          ? round(line.discountAmount / (line.lineTotal + line.discountAmount))
          : 0,
      taxAmount: line.taxAmount,
      totalSales: line.lineTotal,
      netSalesWithoutTax: line.netSalesWithoutTax,
      orderStatus: line.orderStatus,
      paymentStatus: line.paymentStatus,
    };
  });
}

export function buildDayDetails(
  warehouse: WarehouseData,
  lines: MockSaleLine[],
  date: string,
) {
  const dailyLines = lines.filter((line) => line.fullDate === date);
  const summary = summarize(dailyLines);
  const topProduct = buildBreakdown(
    warehouse,
    dailyLines,
    'product',
    'totalSales',
    1,
  )[0];
  const topCustomer = buildBreakdown(
    warehouse,
    dailyLines,
    'customer',
    'totalSales',
    1,
  )[0];
  const topSalesRep = buildBreakdown(
    warehouse,
    dailyLines,
    'salesRep',
    'totalSales',
    1,
  )[0];

  return {
    date,
    ...summary,
    topProduct: topProduct?.label ?? 'N/A',
    topCustomer: topCustomer?.label ?? 'N/A',
    topSalesRep: topSalesRep?.label ?? 'N/A',
  };
}

export function buildSummary(lines: MockSaleLine[]) {
  return summarize(lines);
}
