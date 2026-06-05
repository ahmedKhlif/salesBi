import { Injectable } from '@nestjs/common';
import { CubeService } from '../cube/cube.service';
import { buildApiResponse } from '../../common/types/api-response';
import type { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly cubeService: CubeService) {}

  overview(filters: DashboardFilterDto) {
    const data = this.cubeService.getOverview(filters);
    return buildApiResponse(
      data,
      filters,
      this.cubeService.mode,
      this.cubeService.getSummary(filters),
    );
  }

  salesTrend(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'month'),
      filters,
      this.cubeService.mode,
    );
  }

  quantityTrend(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalQuantitySold', 'month'),
      filters,
      this.cubeService.mode,
    );
  }

  salesDiscountTrend(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalSales', 'month'),
      filters,
      this.cubeService.mode,
    );
  }

  topProductsSales(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'product', 'totalSales', 10),
      filters,
      this.cubeService.mode,
    );
  }

  topProductsQuantity(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(
        filters,
        'product',
        'totalQuantitySold',
        10,
      ),
      filters,
      this.cubeService.mode,
    );
  }

  salesByCity(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'city', 'totalSales', 10),
      filters,
      this.cubeService.mode,
    );
  }

  salesByCustomerStatus(filters: DashboardFilterDto) {
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

  salesBySalesRep(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'salesRep', 'totalSales', 10),
      filters,
      this.cubeService.mode,
    );
  }

  taxByMonth(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'totalTax', 'month'),
      filters,
      this.cubeService.mode,
    );
  }

  discountByProduct(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getBreakdown(filters, 'product', 'totalDiscount', 10),
      filters,
      this.cubeService.mode,
    );
  }

  averageUnitPriceTrend(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getTrend(filters, 'averageUnitPrice', 'month'),
      filters,
      this.cubeService.mode,
    );
  }

  insights(filters: DashboardFilterDto) {
    return buildApiResponse(
      this.cubeService.getInsights(filters),
      filters,
      this.cubeService.mode,
    );
  }
}
