import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { FiltersController } from './filters.controller';
import { FiltersService } from './filters.service';

@Module({
  imports: [CubeModule],
  controllers: [FiltersController],
  providers: [FiltersService],
})
export class FiltersModule {}
