import type { FilterOptionsPayload } from '@saleslens/contracts';
import { Injectable, Logger } from '@nestjs/common';
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
import { buildMdxQuery } from '../mdx/mdx-builder';
import {
  buildMdxFilters,
  type MdxFilterBuildContext,
} from '../mdx/mdx-filter-builder';
import { MdxExecutorService } from '../mdx/mdx-executor.service';
import {
  buildTrendTemplate,
  mdxMeasureMap,
  mdxTemplates,
} from '../mdx/mdx-templates';
import {
  applyFilters,
  buildBreakdown,
  buildCalendarEvents,
  buildDayDetails,
  buildExplorerRows,
  buildInsights,
  buildKpis,
  buildKpisFromSummaries,
  buildPerformanceTable,
  type Summary,
  buildSummary,
  buildTrend,
} from '../../../mock/mock-analytics';

@Injectable()
export class SsasCubeAdapter implements CubeAdapter {
  readonly mode = 'ssas' as const;
  private readonly logger = new Logger(SsasCubeAdapter.name);

  constructor(
    private readonly liveWarehouseService: LiveWarehouseService,
    private readonly mdxExecutorService: MdxExecutorService,
  ) {}

  private get warehouse() {
    return this.liveWarehouseService.getWarehouse();
  }

  getFilterOptions(filters: GlobalFiltersDto): FilterOptionsPayload {
    const warehouse = this.warehouse;
    const filteredSales = applyFilters(warehouse, filters);
    const salesForRange = filteredSales.length
      ? filteredSales
      : warehouse.sales;
    const orderedDates = [
      ...new Set(salesForRange.map((line) => line.fullDate)),
    ].sort((left, right) => left.localeCompare(right));

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
      dateRange: {
        minDate: orderedDates[0],
        maxDate: orderedDates.at(-1),
      },
    };
  }

  getOverview(filters: GlobalFiltersDto): CubeOverviewPayload {
    const warehouse = this.warehouse;
    const current = applyFilters(warehouse, filters);
    const previous = current.slice(
      0,
      Math.max(1, Math.floor(current.length / 2)),
    );
    const mdxKpis = this.tryGetCubeOverviewKpis(filters);

    return {
      kpis: mdxKpis ?? buildKpis(current, previous),
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
    const mdxTrend = this.tryGetCubeTrend(filters, metric, grain);

    if (mdxTrend) {
      return mdxTrend;
    }

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
    const mdxBreakdown = this.tryGetCubeBreakdown(
      filters,
      dimension,
      metric,
      limit,
    );

    if (mdxBreakdown) {
      return mdxBreakdown;
    }

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

  private tryGetCubeTrend(
    filters: GlobalFiltersDto,
    metric: string,
    grain: 'year' | 'quarter' | 'month' | 'day',
  ) {
    const measure = mdxMeasureMap[metric as keyof typeof mdxMeasureMap];

    if (!measure) {
      return null;
    }

    const filterContext: MdxFilterBuildContext = {
      availableYears: [
        ...new Set(this.warehouse.sales.map((line) => line.year)),
      ].sort((left, right) => left - right),
    };

    const filterResult = buildMdxFilters(filters, filterContext);

    if (!filterResult.supported) {
      this.logger.debug(
        `Falling back to warehouse trend for ${metric}/${grain}; unsupported MDX filters: ${filterResult.unsupportedKeys.join(', ')}`,
      );
      return null;
    }

    try {
      const query = buildMdxQuery(
        buildTrendTemplate(
          grain,
          measure,
          process.env.SSAS_CUBE ?? 'SalesAnalysisCube',
        ),
        filterResult.filterSets,
      );

      return this.normalizeTrendRows(
        this.mdxExecutorService.executeRowQuery(query),
        grain,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `MDX trend query failed for ${metric}/${grain}. Falling back to warehouse data. ${reason}`,
      );
      return null;
    }
  }

  private tryGetCubeBreakdown(
    filters: GlobalFiltersDto,
    dimension: string,
    metric: string,
    limit?: number,
  ) {
    const template = this.getBreakdownTemplate(dimension, metric);

    if (!template) {
      return null;
    }

    const filterContext: MdxFilterBuildContext = {
      availableYears: [
        ...new Set(this.warehouse.sales.map((line) => line.year)),
      ].sort((left, right) => left - right),
    };

    const filterResult = buildMdxFilters(filters, filterContext);

    if (!filterResult.supported) {
      this.logger.debug(
        `Falling back to warehouse breakdown for ${dimension}/${metric}; unsupported MDX filters: ${filterResult.unsupportedKeys.join(', ')}`,
      );
      return null;
    }

    try {
      const query = buildMdxQuery(template, filterResult.filterSets);
      return this.normalizeBreakdownRows(
        this.mdxExecutorService.executeRowQuery(query),
        limit,
        dimension,
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `MDX breakdown query failed for ${dimension}/${metric}. Falling back to warehouse data. ${reason}`,
      );
      return null;
    }
  }

  private getBreakdownTemplate(dimension: string, metric: string) {
    if (dimension === 'customerStatus' && metric === 'totalSales') {
      return mdxTemplates.salesByCustomerStatus;
    }

    if (dimension === 'city' && metric === 'totalSales') {
      return mdxTemplates.salesByCity;
    }

    if (dimension === 'salesRep' && metric === 'totalSales') {
      return mdxTemplates.salesBySalesRep;
    }

    if (dimension === 'product' && metric === 'totalSales') {
      return mdxTemplates.topProductsBySales;
    }

    if (dimension === 'product' && metric === 'totalQuantitySold') {
      return mdxTemplates.topProductsByQuantity;
    }

    if (dimension === 'product' && metric === 'totalDiscount') {
      return mdxTemplates.discountByProduct;
    }

    return null;
  }

  private normalizeBreakdownRows(
    rows: Array<{ uniqueName: string; caption: string; value: number | null }>,
    limit?: number,
    dimension?: string,
  ): BreakdownRow[] {
    const normalized = rows
      .filter((row) => !row.uniqueName.includes('.[All]'))
      .map((row) => ({
        id: row.uniqueName || row.caption,
        label: this.resolveBreakdownLabel(row, dimension),
        metric: row.value ?? 0,
      }))
      .sort((left, right) => right.metric - left.metric);

    return typeof limit === 'number' ? normalized.slice(0, limit) : normalized;
  }

  private tryGetCubeOverviewKpis(filters: GlobalFiltersDto) {
    const currentSummary = this.tryGetCubeSummary(filters);

    if (!currentSummary) {
      return null;
    }

    const previousFilters = this.buildPreviousPeriodFilters(filters);
    const previousSummary =
      previousFilters && this.tryGetCubeSummary(previousFilters);

    return buildKpisFromSummaries(
      currentSummary,
      previousSummary ?? this.emptySummary(),
    );
  }

  private tryGetCubeSummary(filters: GlobalFiltersDto): Summary | null {
    const filterContext: MdxFilterBuildContext = {
      availableYears: [
        ...new Set(this.warehouse.sales.map((line) => line.year)),
      ].sort((left, right) => left - right),
    };

    const filterResult = buildMdxFilters(filters, filterContext);

    if (!filterResult.supported) {
      this.logger.debug(
        `Falling back to warehouse overview KPIs; unsupported MDX filters: ${filterResult.unsupportedKeys.join(', ')}`,
      );
      return null;
    }

    try {
      const query = buildMdxQuery(
        mdxTemplates.overviewKpis.replace(
          /\[SalesAnalysisCube\]/g,
          `[${process.env.SSAS_CUBE ?? 'SalesAnalysisCube'}]`,
        ),
        filterResult.filterSets,
      );

      const rows = this.mdxExecutorService.executeRowQuery(query);
      return this.normalizeSummaryRows(rows);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `MDX overview KPI query failed. Falling back to warehouse data. ${reason}`,
      );
      return null;
    }
  }

  private normalizeSummaryRows(
    rows: Array<{ uniqueName: string; caption: string; value: number | null }>,
  ): Summary {
    const measureValues = new Map(
      rows
        .filter((row) => row.uniqueName.startsWith('[Measures].'))
        .map((row) => [row.uniqueName, row.value ?? 0] as const),
    );

    return {
      totalSales: measureValues.get('[Measures].[Total Sales]') ?? 0,
      totalQuantitySold:
        measureValues.get('[Measures].[Total Quantity Sold]') ?? 0,
      totalDiscount: measureValues.get('[Measures].[Total Discount]') ?? 0,
      totalTax: measureValues.get('[Measures].[Total Tax]') ?? 0,
      numberOfSalesLines:
        measureValues.get('[Measures].[Number of Sales Lines]') ?? 0,
      netSalesWithoutTax:
        measureValues.get('[Measures].[Net Sales Without Tax]') ?? 0,
      discountRate: measureValues.get('[Measures].[Discount Rate]') ?? 0,
      averageUnitPrice:
        measureValues.get('[Measures].[Average Unit Price]') ?? 0,
      averageSalesAmount:
        measureValues.get('[Measures].[Average Sales Amount]') ?? 0,
      averageTaxPerSalesLine:
        measureValues.get('[Measures].[Average Tax Per Sales Line]') ?? 0,
    };
  }

  private buildPreviousPeriodFilters(
    filters: GlobalFiltersDto,
  ): GlobalFiltersDto | null {
    if (filters.fromDate && filters.toDate) {
      const start = new Date(`${filters.fromDate}T00:00:00Z`);
      const end = new Date(`${filters.toDate}T00:00:00Z`);
      const durationMs = end.getTime() - start.getTime();
      const previousEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const previousStart = new Date(previousEnd.getTime() - durationMs);

      return {
        ...filters,
        fromDate: previousStart.toISOString().slice(0, 10),
        toDate: previousEnd.toISOString().slice(0, 10),
      };
    }

    if (filters.year?.length) {
      return {
        ...filters,
        year: filters.year.map((year) => year - 1),
      };
    }

    return null;
  }

  private emptySummary(): Summary {
    return {
      totalSales: 0,
      totalQuantitySold: 0,
      totalDiscount: 0,
      totalTax: 0,
      numberOfSalesLines: 0,
      netSalesWithoutTax: 0,
      discountRate: 0,
      averageUnitPrice: 0,
      averageSalesAmount: 0,
      averageTaxPerSalesLine: 0,
    };
  }

  private resolveBreakdownLabel(
    row: { uniqueName: string; caption: string },
    dimension?: string,
  ) {
    if (dimension !== 'salesRep') {
      return row.caption;
    }

    const match = row.uniqueName.match(/&\[(.+?)\]$/);
    const employeeCode = match?.[1] ?? row.caption;
    const rep = this.warehouse.salesReps.find(
      (candidate) => candidate.employeeCode === employeeCode,
    );

    return rep ? `${rep.firstName} ${rep.lastName}` : row.caption;
  }

  private normalizeTrendRows(
    rows: Array<{ uniqueName: string; caption: string; value: number | null }>,
    grain: 'year' | 'quarter' | 'month' | 'day',
  ): SeriesPoint[] {
    const normalized = rows
      .map((row) => {
        const point = this.normalizeTrendRow(row, grain);
        return point
          ? {
              label: point.label,
              value: row.value ?? 0,
              sortKey: point.sortKey,
            }
          : null;
      })
      .filter(
        (
          point,
        ): point is SeriesPoint & {
          sortKey: number;
        } => point !== null,
      );

    return normalized
      .sort((left, right) => left.sortKey - right.sortKey)
      .map((point) => ({
        label: point.label,
        value: point.value,
        secondaryValue: point.secondaryValue,
      }));
  }

  private normalizeTrendRow(
    row: { uniqueName: string; caption: string },
    grain: 'year' | 'quarter' | 'month' | 'day',
  ): { label: string; sortKey: number } | null {
    if (row.uniqueName.includes('.[All]')) {
      return null;
    }

    if (grain === 'year') {
      const match = row.uniqueName.match(/&\[(\d{4})\]$/);
      if (!match) {
        return { label: row.caption, sortKey: Number.MAX_SAFE_INTEGER };
      }

      return {
        label: match[1],
        sortKey: Number(match[1]),
      };
    }

    if (grain === 'quarter') {
      const match = row.uniqueName.match(/&\[(\d{4})\]&\[(\d+)\]$/);
      if (!match) {
        return {
          label: `Q${row.caption}`,
          sortKey: Number.MAX_SAFE_INTEGER,
        };
      }

      return {
        label: `${match[1]} Q${match[2]}`,
        sortKey: Number(match[1]) * 10 + Number(match[2]),
      };
    }

    if (grain === 'month') {
      const match = row.uniqueName.match(/&\[(\d{4})\]&\[(\d+)\]$/);
      if (!match) {
        return { label: row.caption, sortKey: Number.MAX_SAFE_INTEGER };
      }

      const monthNumber = Number(match[2]);
      const monthLabel = new Intl.DateTimeFormat('en', {
        month: 'short',
      }).format(new Date(Date.UTC(Number(match[1]), monthNumber - 1, 1)));

      return {
        label: `${monthLabel} ${match[1]}`,
        sortKey: Number(match[1]) * 100 + monthNumber,
      };
    }

    if (grain === 'day') {
      const match = row.uniqueName.match(/&\[(\d{4}-\d{2}-\d{2})\]$/);
      return {
        label: match?.[1] ?? row.caption,
        sortKey: Number((match?.[1] ?? row.caption).replaceAll('-', '')),
      };
    }

    return null;
  }
}
