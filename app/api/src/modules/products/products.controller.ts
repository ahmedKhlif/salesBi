import { Controller, Get, Query } from '@nestjs/common';
import { GlobalFiltersDto } from '../../common/dto/global-filters.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('performance') performance(@Query() filters: GlobalFiltersDto) {
    return this.productsService.performance(filters);
  }
  @Get('top-sales') topSales(@Query() filters: GlobalFiltersDto) {
    return this.productsService.topSales(filters);
  }
  @Get('top-quantity') topQuantity(@Query() filters: GlobalFiltersDto) {
    return this.productsService.topQuantity(filters);
  }
  @Get('price-comparison') priceComparison(@Query() filters: GlobalFiltersDto) {
    return this.productsService.priceComparison(filters);
  }
  @Get('sales-share') salesShare(@Query() filters: GlobalFiltersDto) {
    return this.productsService.salesShare(filters);
  }
  @Get('performance-matrix') performanceMatrix(
    @Query() filters: GlobalFiltersDto,
  ) {
    return this.productsService.performanceMatrix(filters);
  }
}
