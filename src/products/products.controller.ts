import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { ProductsService } from './products.service';
import { Product } from './dto/products-service-response';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  public findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}
