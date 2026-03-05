import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    if (!process.env.DATABASE_URL)
      throw new Error('DATABASE_URL must be defined');
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
