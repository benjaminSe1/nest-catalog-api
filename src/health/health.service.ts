import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { HealthCheckResponse } from './dto/health-service-response';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  public async check(): Promise<HealthCheckResponse> {
    try {
      const countProduct = await this.prisma.product.count();
      return {
        status: 'ok',
        db: 'up',
        products: countProduct,
      };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
