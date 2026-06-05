import { Module } from '@nestjs/common';
import { CubeModule } from '../cube/cube.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [CubeModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
