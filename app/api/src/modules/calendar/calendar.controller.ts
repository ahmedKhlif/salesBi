import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events') events(@Query() filters: GlobalFiltersDto) {
    return this.calendarService.events(filters);
  }
  @Get('day-details') dayDetails(
    @Query() filters: GlobalFiltersDto & { date?: string },
  ) {
    return this.calendarService.dayDetails(
      filters,
      filters.date ?? filters.fromDate ?? new Date().toISOString().slice(0, 10),
    );
  }
  @Get('best-days') bestDays(@Query() filters: GlobalFiltersDto) {
    return this.calendarService.bestDays(filters);
  }
  @Get('export') export(@Query() filters: GlobalFiltersDto) {
    return this.calendarService.export(filters);
  }
}
