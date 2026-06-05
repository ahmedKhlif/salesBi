import { Injectable } from '@nestjs/common';
import { ExplorerQueryDto } from '../../common/dto/explorer-query.dto';
import { buildApiResponse } from '../../common/types/api-response';
import { CubeService } from '../cube/cube.service';

@Injectable()
export class ExplorerService {
  constructor(private readonly cubeService: CubeService) {}

  list(query: ExplorerQueryDto) {
    const result = this.cubeService.getExplorer(query);
    return buildApiResponse(
      result.rows,
      query,
      this.cubeService.mode,
      undefined,
      {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    );
  }

  exportCsv(query: ExplorerQueryDto) {
    const result = this.cubeService.getExplorer({
      ...query,
      page: 1,
      pageSize: 10_000,
    });
    return buildApiResponse(
      result.rows,
      query,
      this.cubeService.mode,
      undefined,
      {
        total: result.total,
        totalPages: result.totalPages,
        page: 1,
        pageSize: result.rows.length,
      },
    );
  }

  exportExcel(query: ExplorerQueryDto) {
    return this.exportCsv(query);
  }
}
