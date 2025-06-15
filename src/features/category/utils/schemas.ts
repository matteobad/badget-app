import { category_table } from "~/server/db/schema/categories";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const CategoryInsertSchema = createInsertSchema(category_table, {
  description: z.string().optional(),
  type: z.enum(CATEGORY_TYPE),
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
  type: z.enum(CATEGORY_TYPE),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CategoryDeleteSchema = z.object({
  ids: z.array(z.string()),
});
