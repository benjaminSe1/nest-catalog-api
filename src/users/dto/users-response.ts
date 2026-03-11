import { z } from 'zod';

export const createBodySchema = z.object({
  email: z.email(),
  password: z.string().trim().min(10),
});

export type CreateBody = z.infer<typeof createBodySchema>;
