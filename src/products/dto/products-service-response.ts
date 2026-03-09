import { z } from 'zod';

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rate: number;
  rateCount: number;
};

export type ProductsResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().trim().optional(),
  sortBy: z.enum(['id', 'title']).default('id'),
  sortByDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type ProductsQuery = z.infer<typeof productsQuerySchema>;

export const productBodySchema = z.object({
  title: z.string().trim().min(1),
  price: z
    .number()
    .nonnegative()
    .refine((value) => Math.round(value * 100) === value * 100, {
      message: 'Price must have at most 2 decimal places',
    }),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  image: z.url(),
  rate: z.number().gte(0).lte(5).multipleOf(0.5),
  rateCount: z.int().gte(0),
});

export type ProductBody = z.infer<typeof productBodySchema>;
