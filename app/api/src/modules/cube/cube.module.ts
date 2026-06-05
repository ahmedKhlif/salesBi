import { Module } from '@nestjs/common';
import { CubeService } from './cube.service';
import { MockCubeAdapter } from './adapters/mock-cube.adapter';
import { SsasCubeAdapter } from './adapters/ssas-cube.adapter';
import { LiveWarehouseService } from './live/live-warehouse.service';

@Module({
  providers: [
    CubeService,
    MockCubeAdapter,
    SsasCubeAdapter,
    LiveWarehouseService,
  ],
  exports: [CubeService],
})
export class CubeModule {}
