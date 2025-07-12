import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { category_table } from "~/server/db/schema/categories";
import { CATEGORY_TYPE } from "~/server/db/schema/enum";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { getBudgetsSchema } from "./budget.schema";

export const getCategoriesSchema = z.object({
  type: z.enum(CATEGORY_TYPE).nullable().optional(),
  limit: z.number().default(1000),
});

export const getCategoriesWithBudgetsSchema = z.object({
  ...getCategoriesSchema.shape,
  ...getBudgetsSchema.shape,
});

export const selectCategorySchema = createSelectSchema(category_table);

export const createCategorySchema = createInsertSchema(category_table, {
  type: z.enum(CATEGORY_TYPE),
  parentId: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = createUpdateSchema(category_table, {
  id: z.uuid(),
  type: z.enum(CATEGORY_TYPE).optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const deleteCategorySchema = z.object({
  id: z.uuid(),
});

// Query filter schema
export const categoryFilterSchema = z
  .object({
    name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    type: z.enum(CATEGORY_TYPE).nullable().optional(),
    deleted: z.boolean().default(false),
  })
  .optional();

// Search params filter schema
export const categoryFilterParamsSchema = {
  name: parseAsString,
  slug: parseAsString,
  type: parseAsStringLiteral(Object.values(CATEGORY_TYPE)),
  deleted: parseAsBoolean.withDefault(false),
};

// Search params for sheets
export const categoryParamsSchema = {
  categoryId: parseAsString,
  createCategory: parseAsBoolean,
};
