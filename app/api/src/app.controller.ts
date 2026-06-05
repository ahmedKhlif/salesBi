import { Controller, Get } from '@nestjs/common';
import { CubeService } from './modules/cube/cube.service';

@Controller()
export class AppController {
  constructor(private readonly cubeService: CubeService) {}

  @Get()
  getHealth() {
    const mode = this.cubeService.mode;
    return {
      data: {
        status: 'ok',
        mode,
        timestamp: new Date().toISOString(),
      },
      meta: {
        source: mode,
        generatedAt: new Date().toISOString(),
        lastRefresh: new Date().toISOString(),
      },
      appliedFilters: {},
    };
  }
}
