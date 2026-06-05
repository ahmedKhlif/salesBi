import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CubeModule } from './modules/cube/cube.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ExplorerModule } from './modules/explorer/explorer.module';
import { FiltersModule } from './modules/filters/filters.module';
import { ProductsModule } from './modules/products/products.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SalesRepsModule } from './modules/sales-reps/sales-reps.module';
import { TimeAnalysisModule } from './modules/time-analysis/time-analysis.module';

@Module({
  imports: [
    CubeModule,
    DashboardModule,
    ProductsModule,
    CustomersModule,
    SalesRepsModule,
    TimeAnalysisModule,
    CalendarModule,
    ExplorerModule,
    ReportsModule,
    FiltersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
