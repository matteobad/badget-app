import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { category_table } from "~/server/db/schema/categories";

export const CategoryInsertSchema = createInsertSchema(category_table, {
  description: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CategoryUpdateSchema = createInsertSchema(category_table, {
  id: z.string(),
  description: z.string().optional(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CategoryDeleteSchema = z.object({
  ids: z.array(z.string()),
});
