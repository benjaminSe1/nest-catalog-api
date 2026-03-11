import { Body, Controller, Post } from '@nestjs/common';
import { Role } from '@prisma/client';

import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { loginBodySchema, type LoginBody } from './dto/auth-response';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(Role.USER)
  @Post('/login')
  public login(@Body(new ZodValidationPipe(loginBodySchema)) body: LoginBody) {
    return this.authService.login(body);
  }
}
