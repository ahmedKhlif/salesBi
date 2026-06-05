import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [CubeModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
