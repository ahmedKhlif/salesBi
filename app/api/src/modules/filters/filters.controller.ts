import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { FiltersService } from './filters.service';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get() list(@Query() filters: GlobalFiltersDto) {
    return this.filtersService.list(filters);
  }
}
