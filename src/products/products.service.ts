import { Injectable, NotFoundException } from '@nestjs/common';
import type { Product as ProductDB } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import type { Product } from './dto/products-service-response';

@Injectable()
export class ProductsService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findAll(): Promise<Product[]> {
    const productsDB = await this.prisma.product.findMany();
    return productsDB.map((p) => this.productDBToDTO(p));
  }

  public async findOne(id: number): Promise<Product> {
    const productDB = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (productDB) return this.productDBToDTO(productDB);
    else throw new NotFoundException('Product not found');
  }

  private productDBToDTO(productDB: ProductDB): Product {
    return {
      id: productDB.id,
      title: productDB.title,
      price: productDB.price,
      description: productDB.description,
      category: productDB.categoryName,
      image: productDB.image,
      rate: productDB.rate,
      rateCount: productDB.rateCount,
    };
  }
}
