import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { Role } from '@prisma/client';

import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

export function Roles(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
  );
}
