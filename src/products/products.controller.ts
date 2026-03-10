import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
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
  type ProductPatchBody,
  productPatchSchema,
} from './dto/products-service-response';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  public findAll(
    @Query(new ZodValidationPipe(productsQuerySchema))
    query: ProductsQuery,
  ): Promise<ProductsResponse> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  public create(
    @Body(new ZodValidationPipe(productBodySchema)) body: ProductBody,
  ) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  public patch(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(productPatchSchema))
    body: ProductPatchBody,
  ) {
    return this.productsService.patch(id, body);
  }

  @HttpCode(204)
  @Delete(':id')
  public delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
