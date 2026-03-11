import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'argon2';
import { sign } from 'jsonwebtoken';

import { PrismaService } from 'src/prisma/prisma.service';

import { LoginBody } from './dto/auth-response';

@Injectable()
export class AuthService {
  public constructor(private readonly prisma: PrismaService) {}

  public async login(body: LoginBody) {
    const { email, password } = body;
    const userDb = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userDb === null)
      throw new UnauthorizedException('Email or password incorrect');

    const isPwdMatching = await verify(userDb.passwordHash, password);
    if (isPwdMatching) {
      if (process.env.JWT_SECRET === undefined)
        throw new InternalServerErrorException('Missing auth configuration');
      return {
        access_token: sign(
          { sub: userDb.id, role: userDb.role },
          process.env.JWT_SECRET,
          {
            expiresIn: '1h',
          },
        ),
      };
    } else {
      throw new UnauthorizedException('Email or password incorrect');
    }
  }
}
