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
import z from "zod/v4";

export const selectCategorySchema = createSelectSchema(category_table);

export const createCategorySchema = createInsertSchema(category_table, {
  type: z.enum(Object.values(CATEGORY_TYPE)),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = createUpdateSchema(category_table, {
  id: z.cuid2(),
  userId: z.string(),
  type: z.enum(Object.values(CATEGORY_TYPE)),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const deleteCategorySchema = z.object({
  id: z.cuid2(),
  userId: z.string(),
});

// Query filter schema
export const categoryFilterSchema = z
  .object({
    name: z.string().nullable(),
    slug: z.string().nullable(),
    type: z.enum(Object.values(CATEGORY_TYPE)).nullable(),
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
