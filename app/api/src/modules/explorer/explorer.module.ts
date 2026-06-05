import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
  imports: [CubeModule],
  controllers: [ExplorerController],
  providers: [ExplorerService],
})
export class ExplorerModule {}
