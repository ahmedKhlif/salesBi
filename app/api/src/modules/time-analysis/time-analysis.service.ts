import { Injectable } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class TimeAnalysisService {
  constructor(private readonly cubeService: CubeService) {}

  salesByYear(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'year'),
      filters,
      this.cubeService.mode,
    );
  }
  salesByQuarter(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'quarter'),
      filters,
      this.cubeService.mode,
    );
  }
  salesByMonth(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'month'),
      filters,
      this.cubeService.mode,
    );
  }
  salesByDay(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'day'),
      filters,
      this.cubeService.mode,
    );
  }
  calendarHeatmap(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'day'),
      filters,
      this.cubeService.mode,
    );
  }
  cumulativeSales(filters: GlobalFiltersDto) {
    const points = this.cubeService.getTrend(filters, 'totalSales', 'month');
    let running = 0;
    return buildApiResponse(
      points.map((point) => ({ ...point, value: (running += point.value) })),
      filters,
      this.cubeService.mode,
    );
  }
}
