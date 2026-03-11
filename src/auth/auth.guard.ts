import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';

import { tokenPayloadSchema } from './dto/auth-token';
import { AuthenticatedRequest } from './dto/auth-request';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (token === undefined) throw new UnauthorizedException();

    if (process.env.JWT_SECRET === undefined)
      throw new InternalServerErrorException('Missing auth configuration');

    try {
      request.user = tokenPayloadSchema.parse(
        verify(token, process.env.JWT_SECRET),
      );
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
