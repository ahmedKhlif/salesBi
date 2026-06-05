import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { TimeAnalysisService } from './time-analysis.service';

@Controller('time')
export class TimeAnalysisController {
  constructor(private readonly timeAnalysisService: TimeAnalysisService) {}

  @Get('sales-by-year') salesByYear(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.salesByYear(filters);
  }
  @Get('sales-by-quarter') salesByQuarter(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.salesByQuarter(filters);
  }
  @Get('sales-by-month') salesByMonth(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.salesByMonth(filters);
  }
  @Get('sales-by-day') salesByDay(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.salesByDay(filters);
  }
  @Get('calendar-heatmap') calendarHeatmap(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.calendarHeatmap(filters);
  }
  @Get('cumulative-sales') cumulativeSales(@Query() filters: GlobalFiltersDto) {
    return this.timeAnalysisService.cumulativeSales(filters);
  }
}
