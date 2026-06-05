import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('performance') performance(@Query() filters: GlobalFiltersDto) {
    return this.customersService.performance(filters);
  }
  @Get('sales-by-city') salesByCity(@Query() filters: GlobalFiltersDto) {
    return this.customersService.salesByCity(filters);
  }
  @Get('sales-by-status') salesByStatus(@Query() filters: GlobalFiltersDto) {
    return this.customersService.salesByStatus(filters);
  }
  @Get('top-customers') topCustomers(@Query() filters: GlobalFiltersDto) {
    return this.customersService.topCustomers(filters);
  }
  @Get('registration-trend') registrationTrend(
    @Query() filters: GlobalFiltersDto,
  ) {
    return this.customersService.registrationTrend(filters);
  }
}
