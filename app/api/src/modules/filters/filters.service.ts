import { Injectable } from '@nestjs/common';
import { buildApiResponse } from '../../common/types/api-response';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class FiltersService {
  constructor(private readonly cubeService: CubeService) {}

  list(filters: GlobalFiltersDto) {
    return buildApiResponse(
      this.cubeService.getFilterOptions(),
      filters,
      this.cubeService.mode,
    );
  }
}
