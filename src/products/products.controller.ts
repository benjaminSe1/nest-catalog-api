import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

import { ProductsService } from './products.service';
import {
  productBodySchema,
  productsQuerySchema,
  type ProductsQuery,
  type ProductBody,
  type ProductsResponse,
} from './dto/products-service-response';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  public findAll(
    @Query(new ZodValidationPipe(productsQuerySchema))
    query: ProductsQuery,
  ): Promise<ProductsResponse> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  public create(
    @Body(new ZodValidationPipe(productBodySchema)) body: ProductBody,
  ) {
    return this.productService.create(body);
  }
}
