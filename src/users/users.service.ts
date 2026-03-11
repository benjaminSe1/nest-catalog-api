import { ConflictException, Injectable } from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { hash } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateBody } from './dto/users-response';

@Injectable()
export class UsersService {
  public constructor(private readonly prisma: PrismaService) {}

  public async create(body: CreateBody) {
    const { email, password } = body;
    const userToCreate = {
      email,
      role: Role.USER,
      passwordHash: await hash(password),
    };

    try {
      await this.prisma.user.create({
        data: userToCreate,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('This email is already used');
      }
      throw error;
    }

    return { success: true };
  }
}
