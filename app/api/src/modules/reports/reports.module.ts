import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [CubeModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
