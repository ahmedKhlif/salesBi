import { Injectable } from '@nestjs/common';
import type { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import type { ExplorerQueryDto } from '../../common/dto/explorer-query.dto';
import { MockCubeAdapter } from './adapters/mock-cube.adapter';
import { SsasCubeAdapter } from './adapters/ssas-cube.adapter';

@Injectable()
export class CubeService {
  constructor(
    private readonly mockAdapter: MockCubeAdapter,
    private readonly ssasAdapter: SsasCubeAdapter,
  ) {}

  private get adapter() {
    return (process.env.CUBE_ADAPTER ?? process.env.CUBE_MODE ?? 'mock') ===
      'ssas'
      ? this.ssasAdapter
      : this.mockAdapter;
  }

  get mode() {
    return this.adapter.mode;
  }

  getFilterOptions() {
    return this.adapter.getFilterOptions();
  }
  getOverview(filters: GlobalFiltersDto) {
    return this.adapter.getOverview(filters);
  }
  getTrend(
    filters: GlobalFiltersDto,
    metric: string,
    grain: 'year' | 'quarter' | 'month' | 'day',
  ) {
    return this.adapter.getTrend(filters, metric, grain);
  }
  getBreakdown(
    filters: GlobalFiltersDto,
    dimension: string,
    metric: string,
    limit = 10,
  ) {
    return this.adapter.getBreakdown(filters, dimension, metric, limit);
  }
  getProductPerformance(filters: GlobalFiltersDto) {
    return this.adapter.getProductPerformance(filters);
  }
  getCustomerPerformance(filters: GlobalFiltersDto) {
    return this.adapter.getCustomerPerformance(filters);
  }
  getSalesRepPerformance(filters: GlobalFiltersDto) {
    return this.adapter.getSalesRepPerformance(filters);
  }
  getCalendarEvents(filters: GlobalFiltersDto) {
    return this.adapter.getCalendarEvents(filters);
  }
  getCalendarDayDetails(filters: GlobalFiltersDto, date: string) {
    return this.adapter.getCalendarDayDetails(filters, date);
  }
  getExplorer(query: ExplorerQueryDto) {
    return this.adapter.getExplorer(query);
  }
  getInsights(filters: GlobalFiltersDto) {
    return this.adapter.getInsights(filters);
  }
  getSummary(filters: GlobalFiltersDto) {
    return this.adapter.getSummary(filters);
  }
}
