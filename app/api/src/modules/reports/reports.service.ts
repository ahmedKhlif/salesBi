import { Injectable } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class ReportsService {
  constructor(private readonly cubeService: CubeService) {}

  summary(filters: GlobalFiltersDto) {
    return buildApiResponse(
      {
        overview: this.cubeService.getOverview(filters),
        summary: this.cubeService.getSummary(filters),
      },
      filters,
      this.cubeService.mode,
    );
  }
  productPerformance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getProductPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
  customerPerformance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getCustomerPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
  salesRepPerformance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getSalesRepPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
}
