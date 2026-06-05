import { Injectable } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class SalesRepsService {
  constructor(private readonly cubeService: CubeService) {}

  performance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getSalesRepPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
  ranking(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'salesRep', 'totalSales', 12),
      filters,
      this.cubeService.mode,
    );
  }
  contribution(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(
        filters,
        'salesRep',
        'totalQuantitySold',
        12,
      ),
      filters,
      this.cubeService.mode,
    );
  }
  trend(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'averageSalesAmount', 'month'),
      filters,
      this.cubeService.mode,
    );
  }
}
