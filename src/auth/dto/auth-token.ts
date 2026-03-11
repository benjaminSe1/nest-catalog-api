import { Role } from '@prisma/client';
import { z } from 'zod';

export const tokenPayloadSchema = z.object({
  sub: z.number(),
  role: z.enum(Role),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
