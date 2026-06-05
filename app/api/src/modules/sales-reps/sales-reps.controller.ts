import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { SalesRepsService } from './sales-reps.service';

@Controller('sales-reps')
export class SalesRepsController {
  constructor(private readonly salesRepsService: SalesRepsService) {}

  @Get('performance') performance(@Query() filters: GlobalFiltersDto) {
    return this.salesRepsService.performance(filters);
  }
  @Get('ranking') ranking(@Query() filters: GlobalFiltersDto) {
    return this.salesRepsService.ranking(filters);
  }
  @Get('contribution') contribution(@Query() filters: GlobalFiltersDto) {
    return this.salesRepsService.contribution(filters);
  }
  @Get('trend') trend(@Query() filters: GlobalFiltersDto) {
    return this.salesRepsService.trend(filters);
  }
}
