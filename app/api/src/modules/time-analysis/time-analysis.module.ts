import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { TimeAnalysisController } from './time-analysis.controller';
import { TimeAnalysisService } from './time-analysis.service';

@Module({
  imports: [CubeModule],
  controllers: [TimeAnalysisController],
  providers: [TimeAnalysisService],
})
export class TimeAnalysisModule {}
