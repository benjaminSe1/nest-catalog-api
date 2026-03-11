import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Role } from '@prisma/client';

import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/auth/roles.decorator';

import { createBodySchema, type CreateBody } from './dto/users-response';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @HttpCode(201)
  @Post('/create')
  public create(
    @Body(new ZodValidationPipe(createBodySchema)) body: CreateBody,
  ) {
    return this.usersService.create(body);
  }
}
