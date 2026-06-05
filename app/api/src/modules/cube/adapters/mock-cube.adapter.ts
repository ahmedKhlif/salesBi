import type {
  BreakdownRow,
  CalendarEventPayload,
  ExplorerRow,
  FilterOptionsPayload,
  Insight,
  SeriesPoint,
  TablePayload,
} from '@saleslens/contracts';
import { Injectable } from '@nestjs/common';
import type { GlobalFiltersDto } from '../../../common/dto/global-filters.dto';
import type { ExplorerQueryDto } from '../../../common/dto/explorer-query.dto';
import { mockWarehouse } from '../../../mock/mock-warehouse';
import {
  applyFilters,
  buildBreakdown,
  buildCalendarEvents,
  buildDayDetails,
  buildExplorerRows,
  buildInsights,
  buildKpis,
  buildPerformanceTable,
  buildSummary,
  buildTrend,
} from '../../../mock/mock-analytics';
import type {
  CubeAdapter,
  CubeOverviewPayload,
} from '../cube-adapter.interface';

@Injectable()
export class MockCubeAdapter implements CubeAdapter {
  readonly mode = 'mock' as const;

  getFilterOptions(): FilterOptionsPayload {
    return {
      years: [...new Set(mockWarehouse.sales.map((line) => line.year))].map(
        (value) => ({ label: String(value), value }),
      ),
      quarters: [1, 2, 3, 4].map((value) => ({ label: `Q${value}`, value })),
      months: Array.from({ length: 12 }, (_, index) => ({
        label: String(index + 1),
        value: index + 1,
      })),
      products: mockWarehouse.products.slice(0, 30).map((product) => ({
        label: product.productName,
        value: product.productId,
      })),
      customers: mockWarehouse.customers.slice(0, 30).map((customer) => ({
        label: `${customer.firstName} ${customer.lastName}`,
        value: customer.customerId,
      })),
      cities: [
        ...new Set(mockWarehouse.customers.map((customer) => customer.city)),
      ].map((value) => ({ label: value, value })),
      customerStatuses: [
        ...new Set(
          mockWarehouse.customers.map((customer) => customer.customerStatus),
        ),
      ].map((value) => ({ label: value, value })),
      salesReps: mockWarehouse.salesReps.slice(0, 30).map((rep) => ({
        label: `${rep.firstName} ${rep.lastName}`,
        value: rep.employeeId,
      })),
      orderStatuses: [
        ...new Set(mockWarehouse.sales.map((line) => line.orderStatus)),
      ].map((value) => ({ label: value, value })),
      paymentStatuses: [
        ...new Set(mockWarehouse.sales.map((line) => line.paymentStatus)),
      ].map((value) => ({ label: value, value })),
      presets: [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 Days', value: 'last7Days' },
        { label: 'Last 30 Days', value: 'last30Days' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'Last Month', value: 'lastMonth' },
        { label: 'This Quarter', value: 'thisQuarter' },
        { label: 'This Year', value: 'thisYear' },
        { label: 'Custom', value: 'custom' },
      ],
    };
  }

  getOverview(filters: GlobalFiltersDto): CubeOverviewPayload {
    const current = applyFilters(mockWarehouse, filters);
    const previous = current.slice(
      0,
      Math.max(1, Math.floor(current.length / 2)),
    );
    return {
      kpis: buildKpis(current, previous),
      insights: buildInsights(mockWarehouse, current, previous),
      preview: {
        columns: [
          { key: 'label', label: 'Label' },
          { key: 'metric', label: 'Sales' },
          { key: 'secondaryMetric', label: 'Quantity' },
        ],
        rows: buildBreakdown(
          mockWarehouse,
          current,
          'product',
          'totalSales',
          8,
        ).map((row) => ({
          id: row.id,
          label: row.label,
          metric: row.metric,
          secondaryMetric: row.secondaryMetric ?? 0,
          tertiaryMetric: row.tertiaryMetric ?? 0,
        })),
      },
    };
  }

  getTrend(
    filters: GlobalFiltersDto,
    metric: string,
    grain: 'year' | 'quarter' | 'month' | 'day',
  ): SeriesPoint[] {
    const lines = applyFilters(mockWarehouse, filters);
    return buildTrend(lines, grain, metric as never);
  }

  getBreakdown(
    filters: GlobalFiltersDto,
    dimension: string,
    metric: string,
    limit = 10,
  ): BreakdownRow[] {
    const lines = applyFilters(mockWarehouse, filters);
    return buildBreakdown(
      mockWarehouse,
      lines,
      dimension as never,
      metric as never,
      limit,
    );
  }

  getProductPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    return buildPerformanceTable(
      mockWarehouse,
      applyFilters(mockWarehouse, filters),
      'product',
    );
  }

  getCustomerPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    return buildPerformanceTable(
      mockWarehouse,
      applyFilters(mockWarehouse, filters),
      'customer',
    );
  }

  getSalesRepPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    return buildPerformanceTable(
      mockWarehouse,
      applyFilters(mockWarehouse, filters),
      'salesRep',
    );
  }

  getCalendarEvents(filters: GlobalFiltersDto): CalendarEventPayload[] {
    return buildCalendarEvents(applyFilters(mockWarehouse, filters));
  }

  getCalendarDayDetails(filters: GlobalFiltersDto, date: string) {
    return buildDayDetails(
      mockWarehouse,
      applyFilters(mockWarehouse, filters),
      date,
    );
  }

  getExplorer(query: ExplorerQueryDto) {
    const filtered = buildExplorerRows(
      mockWarehouse,
      applyFilters(mockWarehouse, query),
    );
    const search = query.search?.toLowerCase().trim();
    const searched = search
      ? filtered.filter((row) =>
          JSON.stringify(row).toLowerCase().includes(search),
        )
      : filtered;
    const sorted = query.sortBy
      ? [...searched].sort((left, right) => {
          const a = left[query.sortBy as keyof ExplorerRow];
          const b = right[query.sortBy as keyof ExplorerRow];
          if (a === b) return 0;
          const factor = query.sortDir === 'asc' ? 1 : -1;
          return a > b ? factor : -factor;
        })
      : searched;
    const start = (query.page - 1) * query.pageSize;
    const rows = sorted.slice(start, start + query.pageSize);
    return {
      rows,
      total: sorted.length,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(sorted.length / query.pageSize)),
    };
  }

  getInsights(filters: GlobalFiltersDto): Insight[] {
    const current = applyFilters(mockWarehouse, filters);
    const previous = current.slice(
      0,
      Math.max(1, Math.floor(current.length / 2)),
    );
    return buildInsights(mockWarehouse, current, previous);
  }

  getSummary(
    filters: GlobalFiltersDto,
  ): Record<string, string | number | boolean | null> {
    return buildSummary(
      applyFilters(mockWarehouse, filters),
    ) as unknown as Record<string, string | number | boolean | null>;
  }
}
