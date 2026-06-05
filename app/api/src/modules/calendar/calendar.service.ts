import { Injectable } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class CalendarService {
  constructor(private readonly cubeService: CubeService) {}

  events(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getCalendarEvents(filters),
      filters,
      this.cubeService.mode,
    );
  }
  dayDetails(filters: GlobalFiltersDto, date: string) {
    return buildApiResponse(
      this.cubeService.getCalendarDayDetails(filters, date),
      filters,
      this.cubeService.mode,
    );
  }
  bestDays(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService
        .getTrend(filters, 'totalSales', 'day')
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      filters,
      this.cubeService.mode,
    );
  }
  export(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getCalendarEvents(filters),
      filters,
      this.cubeService.mode,
    );
  }
}
