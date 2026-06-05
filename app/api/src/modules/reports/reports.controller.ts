import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary') summary(@Query() filters: GlobalFiltersDto) {
    return this.reportsService.summary(filters);
  }
  @Get('product-performance') productPerformance(
    @Query() filters: GlobalFiltersDto,
  ) {
    return this.reportsService.productPerformance(filters);
  }
  @Get('customer-performance') customerPerformance(
    @Query() filters: GlobalFiltersDto,
  ) {
    return this.reportsService.customerPerformance(filters);
  }
  @Get('sales-rep-performance') salesRepPerformance(
    @Query() filters: GlobalFiltersDto,
  ) {
    return this.reportsService.salesRepPerformance(filters);
  }
}
