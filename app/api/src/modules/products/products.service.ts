import { Injectable } from '@nestjs/common';
import { buildApiResponse } from '../../common/types/api-response';
import type { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class ProductsService {
  constructor(private readonly cubeService: CubeService) {}

  performance(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getProductPerformance(filters),
      filters,
      this.cubeService.mode,
    );
  }
  topSales(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'product', 'totalSales', 12),
      filters,
      this.cubeService.mode,
    );
  }
  topQuantity(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(
        filters,
        'product',
        'totalQuantitySold',
        12,
      ),
      filters,
      this.cubeService.mode,
    );
  }
  priceComparison(filters: GlobalFiltersDto) {
    const rows = this.cubeService
      .getProductPerformance(filters)
      .rows.sort(
        (left, right) =>
          Number(right.totalSales ?? 0) - Number(left.totalSales ?? 0),
      )
      .slice(0, 12);

    return buildApiResponse(
      rows.map((row) => {
        const productName =
          typeof row.productName === 'string' ? row.productName : 'Unknown';
        return {
          label: productName,
          value: Number(row.listPrice ?? 0),
          secondaryValue: Number(row.standardCost ?? 0),
        };
      }),
      filters,
      this.cubeService.mode,
    );
  }
  salesShare(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'product', 'totalSales', 10),
      filters,
      this.cubeService.mode,
    );
  }
  performanceMatrix(filters: GlobalFiltersDto) {
    const rows = this.cubeService
      .getProductPerformance(filters)
      .rows.sort(
        (left, right) =>
          Number(right.totalSales ?? 0) - Number(left.totalSales ?? 0),
      )
      .slice(0, 20);

    return buildApiResponse(
      rows.map((row) => {
        const productId = Number(row.productId ?? 0);
        const productName =
          typeof row.productName === 'string' ? row.productName : 'Unknown';
        return {
          id: `product-${productId}`,
          label: productName,
          metric: Number(row.totalSales ?? 0),
          secondaryMetric: Number(row.totalQuantitySold ?? 0),
          tertiaryMetric: Number(row.averageUnitPrice ?? 0),
        };
      }),
      filters,
      this.cubeService.mode,
    );
  }
}
