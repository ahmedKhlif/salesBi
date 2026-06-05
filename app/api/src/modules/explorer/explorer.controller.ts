import { Controller, Get, Query } from '@nestjs/common';
import { ExplorerQueryDto } from '../../common/dto/explorer-query.dto';
import { ExplorerService } from './explorer.service';

@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @Get() list(@Query() query: ExplorerQueryDto) {
    return this.explorerService.list(query);
  }
  @Get('export/csv') exportCsv(@Query() query: ExplorerQueryDto) {
    return this.explorerService.exportCsv(query);
  }
  @Get('export/excel') exportExcel(@Query() query: ExplorerQueryDto) {
    return this.explorerService.exportExcel(query);
  }
}
