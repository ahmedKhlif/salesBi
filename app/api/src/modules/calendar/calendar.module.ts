import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports: [CubeModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
