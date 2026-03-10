import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product as ProductDB } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';

import type {
  Product,
  ProductBody,
  ProductPatchBody,
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
    if (productDB === null) throw new NotFoundException('Product not found');

    return this.productDBToDTO(productDB);
  }

  public async create(body: ProductBody): Promise<Product> {
    const productDB = await this.prisma.product.create({
      data: {
        ...body,
        category: {
          connectOrCreate: {
            where: { name: body.category },
            create: { name: body.category },
          },
        },
      },
    });
    return this.productDBToDTO(productDB);
  }

  public async patch(id: number, body: ProductPatchBody): Promise<Product> {
    const data: Prisma.ProductUpdateInput = {
      ...body,
      category:
        body.category !== undefined
          ? {
              connectOrCreate: {
                where: { name: body.category },
                create: { name: body.category },
              },
            }
          : undefined,
    };
    try {
      const productDB = await this.prisma.product.update({
        data,
        where: { id },
      });
      return this.productDBToDTO(productDB);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  public async delete(id: number): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
      return;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Product not found');
      }
      throw error;
    }
  }

  private productDBToDTO(productDB: ProductDB): Product {
    return {
      id: productDB.id,
      title: productDB.title,
      price: productDB.price.toString(),
      description: productDB.description,
      category: productDB.categoryName,
      image: productDB.image,
      rate: productDB.rate,
      rateCount: productDB.rateCount,
    };
  }
}
