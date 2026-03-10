import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createProductPayload = (
    overrides?: Partial<Record<string, unknown>>,
  ) => ({
    title: 'Product title',
    price: '10.25',
    description: 'Product description',
    category: 'electronics',
    image: 'https://example.com/product.jpg',
    rate: 4.5,
    rateCount: 10,
    ...overrides,
  });

  const seedProduct = async (overrides?: Partial<Record<string, unknown>>) => {
    const payload = createProductPayload(overrides);

    return prisma.product.create({
      data: {
        title: payload.title,
        price: payload.price,
        description: payload.description,
        image: payload.image,
        rate: payload.rate,
        rateCount: payload.rateCount,
        category: {
          connectOrCreate: {
            where: { name: payload.category },
            create: { name: payload.category },
          },
        },
      },
    });
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      await seedProduct({ title: 'Product A' });
      await seedProduct({ title: 'Product B' });

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toStrictEqual({
        items: [
          {
            id: expect.any(Number),
            title: expect.any(String),
            price: '10.25',
            description: 'Product description',
            category: 'electronics',
            image: 'https://example.com/product.jpg',
            rate: 4.5,
            rateCount: 10,
          },
          {
            id: expect.any(Number),
            title: expect.any(String),
            price: '10.25',
            description: 'Product description',
            category: 'electronics',
            image: 'https://example.com/product.jpg',
            rate: 4.5,
            rateCount: 10,
          },
        ],
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by category', async () => {
      await seedProduct({ title: 'TV', category: 'electronics' });
      await seedProduct({ title: 'Book', category: 'books' });

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ category: 'books' })
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        title: 'Book',
        category: 'books',
      });
      expect(response.body.total).toBe(1);
    });

    it('should apply sorting', async () => {
      await seedProduct({ title: 'B title' });
      await seedProduct({ title: 'A title' });

      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ sortBy: 'title', sortByDirection: 'asc' })
        .expect(200);

      expect(response.body.items[0].title).toBe('A title');
      expect(response.body.items[1].title).toBe('B title');
    });

    it('should validate query params', async () => {
      await request(app.getHttpServer())
        .get('/products')
        .query({ page: 0 })
        .expect(400);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product', async () => {
      const product = await seedProduct({ title: 'Single product' });
      const response = await request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(200);

      expect(response.body).toStrictEqual({
        id: product.id,
        title: 'Single product',
        price: '10.25',
        description: 'Product description',
        category: 'electronics',
        image: 'https://example.com/product.jpg',
        rate: 4.5,
        rateCount: 10,
      });
    });

    it('should return 404 when product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/999999')
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });

    it('should return 400 when id is invalid', async () => {
      await request(app.getHttpServer())
        .get('/products/not-a-number')
        .expect(400);
    });
  });

  describe('POST /products', () => {
    it('should create a product', async () => {
      const payload = createProductPayload({ title: 'Created product' });

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(payload)
        .expect(201);

      expect(response.body).toStrictEqual({
        id: expect.any(Number),
        title: 'Created product',
        price: '10.25',
        description: 'Product description',
        category: 'electronics',
        image: 'https://example.com/product.jpg',
        rate: 4.5,
        rateCount: 10,
      });

      const productInDb = await prisma.product.findUnique({
        where: { id: response.body.id },
      });

      expect(productInDb).not.toBeNull();
      expect(productInDb?.title).toBe('Created product');
      expect(productInDb?.categoryName).toBe('electronics');
    });

    it('should create category if it does not exist', async () => {
      const payload = createProductPayload({ category: 'new-category' });

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(payload)
        .expect(201);

      expect(response.body.category).toBe('new-category');

      const category = await prisma.category.findUnique({
        where: { name: 'new-category' },
      });

      expect(category).not.toBeNull();
    });

    it('should validate request body', async () => {
      const payload = createProductPayload({ price: -1 });

      await request(app.getHttpServer())
        .post('/products')
        .send(payload)
        .expect(400);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', async () => {
      const product = await seedProduct({ title: 'Old title', price: 10.25 });

      const response = await request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .send({
          title: 'Updated title',
          price: '99.99',
        })
        .expect(200);

      expect(response.body).toStrictEqual({
        id: product.id,
        title: 'Updated title',
        price: '99.99',
        description: 'Product description',
        category: 'electronics',
        image: 'https://example.com/product.jpg',
        rate: 4.5,
        rateCount: 10,
      });

      const updated = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(updated?.title).toBe('Updated title');
      expect(updated?.price.toString()).toBe('99.99');
    });

    it('should update category when provided', async () => {
      const product = await seedProduct({ category: 'electronics' });

      const response = await request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .send({
          category: 'books',
        })
        .expect(200);

      expect(response.body.category).toBe('books');

      const updated = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(updated?.categoryName).toBe('books');

      const category = await prisma.category.findUnique({
        where: { name: 'books' },
      });

      expect(category).not.toBeNull();
    });

    it('should return 404 when product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/products/999999')
        .send({
          title: 'Updated title',
        })
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });

    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .patch('/products/1')
        .send({})
        .expect(400);
    });

    it('should validate request body', async () => {
      const product = await seedProduct();

      await request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .send({
          price: 12.345,
        })
        .expect(400);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const product = await seedProduct();

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .expect(204);

      const deleted = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(deleted).toBeNull();
    });

    it('should return 404 when product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/products/999999')
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });

    it('should return 400 when id is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/products/not-a-number')
        .expect(400);
    });
  });

  describe('GET /categories', () => {
    it('should return list of categories', async () => {
      await seedProduct({ category: 'electronics' });
      await seedProduct({ category: 'books' });
      await seedProduct({ category: 'electronics' });

      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toStrictEqual(['books', 'electronics']);
    });

    it('should return empty array when no category exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toStrictEqual([]);
    });
  });
});
