import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().trim().min(1),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
