import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { SalesRepsController } from './sales-reps.controller';
import { SalesRepsService } from './sales-reps.service';

@Module({
  imports: [CubeModule],
  controllers: [SalesRepsController],
  providers: [SalesRepsService],
})
export class SalesRepsModule {}
