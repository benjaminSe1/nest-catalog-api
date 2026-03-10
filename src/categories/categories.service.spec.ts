import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from 'src/prisma/prisma.service';

import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
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

    service = new CategoriesService(prisma);
  });

  describe('findCategories', () => {
    it('should return list of categories', async () => {
      const findManySpy = vi
        .spyOn(prisma.category, 'findMany')
        .mockResolvedValue([{ name: 'books' }, { name: 'electronics' }]);

      const categories = await service.findAll();

      expect(findManySpy).toHaveBeenCalledWith({
        select: { name: true },
        orderBy: { name: 'asc' },
      });
      expect(categories).toStrictEqual(['books', 'electronics']);
    });
  });
});
