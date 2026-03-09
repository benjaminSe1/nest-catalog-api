import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Product as ProductDB } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import type {
  Product,
  ProductBody,
  ProductsQuery,
  ProductsResponse,
} from './dto/products-service-response';

@Injectable()
export class ProductsService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findAll(query: ProductsQuery): Promise<ProductsResponse> {
    const { page, limit, category, sortBy, sortByDirection } = query;
    const skip = limit * (page - 1);
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'id' ? { id: sortByDirection } : { title: sortByDirection };

    const where: Prisma.ProductWhereInput =
      category != null ? { categoryName: category } : {};

    const [productsDB, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy,
        where,
      }),
      this.prisma.product.count({
        where,
      }),
    ]);

    return {
      items: productsDB.map((p) => this.productDBToDTO(p)),
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findOne(id: number): Promise<Product> {
    const productDB = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!productDB) throw new NotFoundException('Product not found');

    return this.productDBToDTO(productDB);
  }

  public async create(body: ProductBody): Promise<Product> {
    const productDB = await this.prisma.product.create({
      data: {
        title: body.title,
        price: body.price,
        description: body.description,
        category: {
          connectOrCreate: {
            where: { name: body.category },
            create: { name: body.category },
          },
        },
        image: body.image,
        rate: body.rate,
        rateCount: body.rateCount,
      },
    });
    return this.productDBToDTO(productDB);
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
