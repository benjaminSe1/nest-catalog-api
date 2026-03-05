import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findAll(): Promise<string[]> {
    const categories = await this.prisma.category.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    return categories.map((category) => category.name);
  }
}
