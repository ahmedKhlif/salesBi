import type {
  BreakdownRow,
  CalendarEventPayload,
  ExplorerRow,
  Insight,
  MetricCard,
  SeriesPoint,
  TablePayload,
} from '@saleslens/contracts';
import type { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import type { ExplorerQueryDto } from '../../common/dto/explorer-query.dto';

export interface CubeOverviewPayload {
  kpis: MetricCard[];
  insights: Insight[];
  preview: TablePayload<Record<string, unknown>>;
}

export interface CubeAdapter {
  readonly mode: 'mock' | 'ssas';
  getFilterOptions(filters: GlobalFiltersDto): unknown;
  getOverview(filters: GlobalFiltersDto): CubeOverviewPayload;
  getTrend(
    filters: GlobalFiltersDto,
    metric: string,
    grain: 'year' | 'quarter' | 'month' | 'day',
  ): SeriesPoint[];
  getBreakdown(
    filters: GlobalFiltersDto,
    dimension: string,
    metric: string,
    limit?: number,
  ): BreakdownRow[];
  getProductPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>>;
  getCustomerPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>>;
  getSalesRepPerformance(
    filters: GlobalFiltersDto,
  ): TablePayload<Record<string, unknown>>;
  getCalendarEvents(filters: GlobalFiltersDto): CalendarEventPayload[];
  getCalendarDayDetails(
    filters: GlobalFiltersDto,
    date: string,
  ): Record<string, unknown>;
  getExplorer(query: ExplorerQueryDto): {
    rows: ExplorerRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  getInsights(filters: GlobalFiltersDto): Insight[];
  getSummary(
    filters: GlobalFiltersDto,
  ): Record<string, string | number | boolean | null>;
}
