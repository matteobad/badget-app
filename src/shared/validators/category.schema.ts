import { z } from "@hono/zod-openapi"; // Extended Zod instance

import { transaction_category_table } from "~/server/db/schema/transactions";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { getBudgetsSchema } from "./budget.schema";

export const getCategoriesSchema = z.object({
  limit: z.number().default(1000),
});

export const getCategoriesWithBudgetsSchema = z.object({
  ...getCategoriesSchema.shape,
  ...getBudgetsSchema.shape,
});

export const selectCategorySchema = createSelectSchema(
  transaction_category_table,
);

export const createCategorySchema = createInsertSchema(
  transaction_category_table,
  {
    parentId: z.string().optional(),
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  organizationId: true,
});

export const updateCategorySchema = createUpdateSchema(
  transaction_category_table,
  {
    id: z.uuid(),
  },
).omit({
  createdAt: true,
  updatedAt: true,
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
});
