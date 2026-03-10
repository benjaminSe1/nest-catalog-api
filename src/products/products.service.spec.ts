import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Prisma, type Product as ProductDB } from '@prisma/client';

import type { PrismaService } from 'src/prisma/prisma.service';

import { ProductsService } from './products.service';
import {
  productBodySchema,
  productPatchSchema,
  productsQuerySchema,
} from './dto/products-service-response';

const generateProduct = (quantity = 10): ProductDB[] => {
  const products: ProductDB[] = [];

  for (let i = 0; i < quantity; i++) {
    products.push({
      id: i + 1,
      title: `title${i}`,
      price: new Prisma.Decimal(10.25),
      description: `description${i}`,
      categoryName: 'category',
      image: `image${i}`,
      rate: 4.5,
      rateCount: 25,
    });
  }

  return products;
};

const createPrismaKnownRequestError = (code: string, message: string) =>
  new Prisma.PrismaClientKnownRequestError(message, {
    code,
    clientVersion: 'test',
  });

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: {
        findMany: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new ProductsService(prisma);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const findManySpy = vi
        .spyOn(prisma.product, 'findMany')
        .mockResolvedValue(generateProduct(10));
      const countSpy = vi.spyOn(prisma.product, 'count').mockResolvedValue(15);

      const response = await service.findAll(productsQuerySchema.parse({}));

      expect(findManySpy).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { id: 'asc' },
        where: {},
      });
      expect(countSpy).toHaveBeenCalledWith({
        where: {},
      });

      expect(response).toStrictEqual({
        items: [
          {
            id: 1,
            title: 'title0',
            price: '10.25',
            description: 'description0',
            category: 'category',
            image: 'image0',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 2,
            title: 'title1',
            price: '10.25',
            description: 'description1',
            category: 'category',
            image: 'image1',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 3,
            title: 'title2',
            price: '10.25',
            description: 'description2',
            category: 'category',
            image: 'image2',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 4,
            title: 'title3',
            price: '10.25',
            description: 'description3',
            category: 'category',
            image: 'image3',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 5,
            title: 'title4',
            price: '10.25',
            description: 'description4',
            category: 'category',
            image: 'image4',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 6,
            title: 'title5',
            price: '10.25',
            description: 'description5',
            category: 'category',
            image: 'image5',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 7,
            title: 'title6',
            price: '10.25',
            description: 'description6',
            category: 'category',
            image: 'image6',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 8,
            title: 'title7',
            price: '10.25',
            description: 'description7',
            category: 'category',
            image: 'image7',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 9,
            title: 'title8',
            price: '10.25',
            description: 'description8',
            category: 'category',
            image: 'image8',
            rate: 4.5,
            rateCount: 25,
          },
          {
            id: 10,
            title: 'title9',
            price: '10.25',
            description: 'description9',
            category: 'category',
            image: 'image9',
            rate: 4.5,
            rateCount: 25,
          },
        ],
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
    });

    it('should filter by category and apply sorting', async () => {
      const findManySpy = vi
        .spyOn(prisma.product, 'findMany')
        .mockResolvedValue(generateProduct(3));
      const countSpy = vi.spyOn(prisma.product, 'count').mockResolvedValue(3);

      await service.findAll(
        productsQuerySchema.parse({
          category: 'categoryWhere',
          sortBy: 'title',
          sortByDirection: 'desc',
          page: 2,
          limit: 5,
        }),
      );

      expect(findManySpy).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { title: 'desc' },
        where: { categoryName: 'categoryWhere' },
      });
      expect(countSpy).toHaveBeenCalledWith({
        where: { categoryName: 'categoryWhere' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product when it exists', async () => {
      const findUniqueSpy = vi
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(generateProduct(1)[0]);

      const product = await service.findOne(1);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(product).toStrictEqual({
        id: 1,
        title: 'title0',
        price: '10.25',
        description: 'description0',
        category: 'category',
        image: 'image0',
        rate: 4.5,
        rateCount: 25,
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const findUniqueSpy = vi
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrowError(
        new NotFoundException('Product not found'),
      );

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const body = productBodySchema.parse({
        title: 'Keyboard',
        price: '99.99',
        description: 'Mechanical keyboard',
        category: 'electronics',
        image: 'https://example.com/keyboard.jpg',
        rate: 4.5,
        rateCount: 10,
      });

      const createSpy = vi.spyOn(prisma.product, 'create').mockResolvedValue({
        id: 42,
        title: body.title,
        price: Prisma.Decimal(body.price),
        description: body.description,
        categoryName: body.category,
        image: body.image,
        rate: body.rate,
        rateCount: body.rateCount,
      });

      const product = await service.create(body);

      expect(createSpy).toHaveBeenCalledWith({
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

      expect(product).toStrictEqual({
        id: 42,
        title: 'Keyboard',
        price: '99.99',
        description: 'Mechanical keyboard',
        category: 'electronics',
        image: 'https://example.com/keyboard.jpg',
        rate: 4.5,
        rateCount: 10,
      });
    });

    it('should create category if it does not exist', async () => {
      const body = productBodySchema.parse({
        title: 'Mouse',
        price: 49.9,
        description: 'Wireless mouse',
        category: 'new-category',
        image: 'https://example.com/mouse.jpg',
        rate: 4,
        rateCount: 3,
      });

      const createSpy = vi.spyOn(prisma.product, 'create').mockResolvedValue({
        id: 1,
        title: body.title,
        price: Prisma.Decimal(body.price),
        description: body.description,
        categoryName: body.category,
        image: body.image,
        rate: body.rate,
        rateCount: body.rateCount,
      });

      await service.create(body);

      expect(createSpy).toHaveBeenCalledWith({
        data: {
          ...body,
          category: {
            connectOrCreate: {
              where: { name: 'new-category' },
              create: { name: 'new-category' },
            },
          },
        },
      });
    });
  });

  describe('patch', () => {
    it('should update product fields', async () => {
      const body = productPatchSchema.parse({
        title: 'Updated title',
        price: 12.5,
      });

      const updateSpy = vi.spyOn(prisma.product, 'update').mockResolvedValue({
        id: 1,
        title: 'Updated title',
        price: Prisma.Decimal(12.5),
        description: 'description0',
        categoryName: 'category',
        image: 'image0',
        rate: 4.5,
        rateCount: 25,
      });

      const product = await service.patch(1, body);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...body,
          category: undefined,
        },
      });

      expect(product).toStrictEqual({
        id: 1,
        title: 'Updated title',
        price: 12.5,
        description: 'description0',
        category: 'category',
        image: 'image0',
        rate: 4.5,
        rateCount: 25,
      });
    });

    it('should update category when provided', async () => {
      const body = productPatchSchema.parse({
        category: 'updated-category',
      });

      const updateSpy = vi.spyOn(prisma.product, 'update').mockResolvedValue({
        id: 1,
        title: 'title0',
        price: Prisma.Decimal(10.25),
        description: 'description0',
        categoryName: 'updated-category',
        image: 'image0',
        rate: 4.5,
        rateCount: 25,
      });

      await service.patch(1, body);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...body,
          category: {
            connectOrCreate: {
              where: { name: 'updated-category' },
              create: { name: 'updated-category' },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const body = productPatchSchema.parse({
        title: 'Updated title',
      });

      const updateSpy = vi
        .spyOn(prisma.product, 'update')
        .mockRejectedValue(
          createPrismaKnownRequestError('P2025', 'Record to update not found.'),
        );

      await expect(service.patch(999, body)).rejects.toThrowError(
        new NotFoundException('Product not found'),
      );

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 999 },
        data: {
          ...body,
          category: undefined,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete an existing product', async () => {
      const deleteSpy = vi
        .spyOn(prisma.product, 'delete')
        .mockResolvedValue(generateProduct(1)[0]);

      await expect(service.delete(1)).resolves.toBeUndefined();

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const deleteSpy = vi
        .spyOn(prisma.product, 'delete')
        .mockRejectedValue(
          createPrismaKnownRequestError(
            'P2025',
            'Record to delete does not exist.',
          ),
        );

      await expect(service.delete(999)).rejects.toThrowError(
        new NotFoundException('Product not found'),
      );

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });
});
