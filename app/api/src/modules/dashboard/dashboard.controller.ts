import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview') overview(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.overview(filters);
  }
  @Get('sales-trend') salesTrend(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.salesTrend(filters);
  }
  @Get('quantity-trend') quantityTrend(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.quantityTrend(filters);
  }
  @Get('sales-discount-trend') salesDiscountTrend(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.salesDiscountTrend(filters);
  }
  @Get('top-products-sales') topProductsSales(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.topProductsSales(filters);
  }
  @Get('top-products-quantity') topProductsQuantity(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.topProductsQuantity(filters);
  }
  @Get('sales-by-city') salesByCity(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.salesByCity(filters);
  }
  @Get('sales-by-customer-status') salesByCustomerStatus(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.salesByCustomerStatus(filters);
  }
  @Get('sales-by-sales-rep') salesBySalesRep(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.salesBySalesRep(filters);
  }
  @Get('tax-by-month') taxByMonth(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.taxByMonth(filters);
  }
  @Get('discount-by-product') discountByProduct(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.discountByProduct(filters);
  }
  @Get('average-unit-price-trend') averageUnitPriceTrend(
    @Query() filters: DashboardFilterDto,
  ) {
    return this.dashboardService.averageUnitPriceTrend(filters);
  }
  @Get('insights') insights(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.insights(filters);
  }
}
