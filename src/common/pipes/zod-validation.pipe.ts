import type { PipeTransform } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { Schema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    return result.data;
  }
}
