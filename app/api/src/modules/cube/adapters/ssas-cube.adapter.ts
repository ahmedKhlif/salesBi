import type { FilterOptionsPayload } from '@saleslens/contracts';
import { Injectable } from '@nestjs/common';
import type {
  BreakdownRow,
  CalendarEventPayload,
  ExplorerRow,
  Insight,
  SeriesPoint,
  TablePayload,
} from '@saleslens/contracts';
import type { GlobalFiltersDto } from '../../../common/dto/global-filters.dto';
import type { ExplorerQueryDto } from '../../../common/dto/explorer-query.dto';
import type {
  CubeAdapter,
  CubeOverviewPayload,
} from '../cube-adapter.interface';
import { LiveWarehouseService } from '../live/live-warehouse.service';
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

@Injectable()
export class SsasCubeAdapter implements CubeAdapter {
  readonly mode = 'ssas' as const;

  constructor(private readonly liveWarehouseService: LiveWarehouseService) {}

  private get warehouse() {
    return this.liveWarehouseService.getWarehouse();
  }

  getFilterOptions(): FilterOptionsPayload {
    const warehouse = this.warehouse;
    return {
      years: [...new Set(warehouse.sales.map((line) => line.year))]
        .sort((left, right) => left - right)
        .map((value) => ({ label: String(value), value })),
      quarters: [...new Set(warehouse.sales.map((line) => line.quarter))]
        .sort((left, right) => left - right)
        .map((value) => ({ label: `Q${value}`, value })),
      months: [...new Set(warehouse.sales.map((line) => line.monthNumber))]
        .sort((left, right) => left - right)
        .map((value) => ({ label: String(value), value })),
      products: warehouse.products.map((product) => ({
        label: product.productName,
        value: product.productId,
      })),
      customers: warehouse.customers.map((customer) => ({
        label: `${customer.firstName} ${customer.lastName}`,
        value: customer.customerId,
      })),
      cities: [...new Set(warehouse.customers.map((customer) => customer.city))]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value })),
      customerStatuses: [
        ...new Set(
          warehouse.customers.map((customer) => customer.customerStatus),
        ),
      ]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value })),
      salesReps: warehouse.salesReps.map((rep) => ({
        label: `${rep.firstName} ${rep.lastName}`,
        value: rep.employeeId,
      })),
      orderStatuses: [
        ...new Set(warehouse.sales.map((line) => line.orderStatus)),
      ]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value })),
      paymentStatuses: [
        ...new Set(warehouse.sales.map((line) => line.paymentStatus)),
      ]
        .sort((left, right) => left.localeCompare(right))
        .map((value) => ({ label: value, value })),
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
    const warehouse = this.warehouse;
    const current = applyFilters(warehouse, filters);
    const previous = current.slice(
      0,
      Math.max(1, Math.floor(current.length / 2)),
    );
    return {
      kpis: buildKpis(current, previous),
      insights: buildInsights(warehouse, current, previous),
      preview: {
        columns: [
          { key: 'label', label: 'Label' },
          { key: 'metric', label: 'Sales' },
          { key: 'secondaryMetric', label: 'Quantity' },
        ],
        rows: buildBreakdown(
          warehouse,
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
    return buildTrend(
      applyFilters(this.warehouse, filters),
      grain,
      metric as never,
    );
  }
  getBreakdown(
    filters: GlobalFiltersDto,
    dimension: string,
    metric: string,
    limit?: number,
  ): BreakdownRow[] {
    const warehouse = this.warehouse;
    return buildBreakdown(
      warehouse,
      applyFilters(warehouse, filters),
      dimension as never,
      metric as never,
      limit,
    );
  }
  getProductPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    const warehouse = this.warehouse;
    return buildPerformanceTable(
      warehouse,
      applyFilters(warehouse, filters),
      'product',
    );
  }
  getCustomerPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    const warehouse = this.warehouse;
    return buildPerformanceTable(
      warehouse,
      applyFilters(warehouse, filters),
      'customer',
    );
  }
  getSalesRepPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>> {
    const warehouse = this.warehouse;
    return buildPerformanceTable(
      warehouse,
      applyFilters(warehouse, filters),
      'salesRep',
    );
  }
  getCalendarEvents(filters: GlobalFiltersDto): CalendarEventPayload[] {
    return buildCalendarEvents(applyFilters(this.warehouse, filters));
  }
  getCalendarDayDetails(
    filters: GlobalFiltersDto,
    date: string,
  ): Record<string, unknown> {
    const warehouse = this.warehouse;
    return buildDayDetails(warehouse, applyFilters(warehouse, filters), date);
  }
  getExplorer(query: ExplorerQueryDto): {
    rows: ExplorerRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const warehouse = this.warehouse;
    const filtered = buildExplorerRows(
      warehouse,
      applyFilters(warehouse, query),
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
    const warehouse = this.warehouse;
    const current = applyFilters(warehouse, filters);
    const previous = current.slice(
      0,
      Math.max(1, Math.floor(current.length / 2)),
    );
    return buildInsights(warehouse, current, previous);
  }
  getSummary(
    filters: GlobalFiltersDto,
  ): Record<string, string | number | boolean | null> {
    return buildSummary(
      applyFilters(this.warehouse, filters),
    ) as unknown as Record<string, string | number | boolean | null>;
  }
}
