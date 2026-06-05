import { Injectable } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class CustomersService {
  constructor(private readonly cubeService: CubeService) {}

  performance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getCustomerPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
  salesByCity(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'city', 'totalSales', 12),
      filters,
      this.cubeService.mode,
    );
  }
  salesByStatus(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(
        filters,
        'customerStatus',
        'totalSales',
        10,
      ),
      filters,
      this.cubeService.mode,
    );
  }
  topCustomers(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'customer', 'totalSales', 12),
      filters,
      this.cubeService.mode,
    );
  }
  registrationTrend(filters: GlobalFiltersDto) {
    const rows = this.cubeService.getCustomerPerformance(filters).rows;
    const grouped = rows.reduce<Record<string, number>>((accumulator, row) => {
      const registrationDate =
        typeof row.registrationDate === 'string' ? row.registrationDate : '';
      const label = registrationDate ? registrationDate.slice(0, 7) : 'Unknown';
      accumulator[label] = (accumulator[label] ?? 0) + 1;
      return accumulator;
    }, {});

    return buildApiResponse(
      Object.entries(grouped)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([label, value]) => ({ label, value })),
      filters,
      this.cubeService.mode,
    );
  }
}
