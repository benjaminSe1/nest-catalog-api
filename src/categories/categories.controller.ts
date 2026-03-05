import { Controller, Get } from '@nestjs/common';

import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  public constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  public findAll(): Promise<string[]> {
    return this.categoriesService.findAll();
  }
}
