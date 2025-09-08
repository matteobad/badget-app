import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { parseAsBoolean, parseAsString } from "nuqs";

import { CATEGORY_TYPE } from "../constants/enum";

export const getTransactionCategoriesSchema = z
  .object({
    q: z.string().nullable().optional().openapi({
      description: "Search query for transaction categories",
      example: "groceries",
    }),
  })
  .optional()
  .openapi("GetTransactionCategoriesSchema");

export const getTransactionCategorySchema = z
  .object({
    id: z.uuid().openapi({
      description: "The UUID of the transaction category",
      example: "b3b7e6c2-1f2a-4e5b-8c3d-9a1b2c3d4e5f",
    }),
  })
  .openapi("GetTransactionCategorySchema");

export const createTransactionCategorySchema = z
  .object({
    color: z.string().openapi({
      description:
        "The color of the transaction category (e.g. hex code or color name)",
      example: "#FF5733",
    }),
    icon: z.string().openapi({
      description: "The icon identifier for the transaction category",
      example: "shopping-cart",
    }),
    name: z.string().openapi({
      description: "The name of the transaction category",
      example: "Groceries",
    }),
    description: z.string().optional().openapi({
      description: "A description of the transaction category",
      example: "Expenses for food and household supplies",
    }),
    type: z.enum(CATEGORY_TYPE).openapi({
      description: "The type of the transaction category",
      example: "expense",
    }),
    parentId: z.uuid().optional().openapi({
      description: "The UUID of the parent category, if this is a subcategory",
      example: "a1b2c3d4-e5f6-7a8b-9c0d-ef1234567890",
    }),
    excludeFromAnalytics: z.boolean().optional().openapi({
      description: "Whether to exclude this category from analytics",
      example: false,
      default: false,
    }),
  })
  .openapi("CreateTransactionCategorySchema");

export const updateTransactionCategorySchema = z
  .object({
    id: z.uuid().openapi({
      description: "The UUID of the transaction category",
      example: "b3b7e6c2-1f2a-4e5b-8c3d-9a1b2c3d4e5f",
    }),
    color: z.string().optional().openapi({
      description:
        "The color of the transaction category (e.g. hex code or color name)",
      example: "#FF5733",
    }),
    icon: z.string().optional().openapi({
      description: "The icon identifier for the transaction category",
      example: "shopping-cart",
    }),
    name: z.string().optional().openapi({
      description: "The name of the transaction category",
      example: "Groceries",
    }),
    description: z.string().optional().openapi({
      description: "A description of the transaction category",
      example: "Expenses for food and household supplies",
    }),
    parentId: z.uuid().optional().openapi({
      description: "The UUID of the parent category, if this is a subcategory",
      example: "a1b2c3d4-e5f6-7a8b-9c0d-ef1234567890",
    }),
    excludeFromAnalytics: z.boolean().optional().openapi({
      description: "Whether to exclude this category from analytics",
      example: false,
      default: false,
    }),
  })
  .openapi("UpdateTransactionCategorySchema");

export const deleteTransactionCategorySchema = z
  .object({
    id: z.uuid().openapi({
      description: "The UUID of the transaction category",
      example: "b3b7e6c2-1f2a-4e5b-8c3d-9a1b2c3d4e5f",
    }),
  })
  .openapi("DeleteTransactionCategorySchema");

// Search params filter schema
export const transactionCategoryFilterParamsSchema = {
  q: parseAsString,
};

// Search params for sheets
export const trsanctionCategoryParamsSchema = {
  categoryId: parseAsString,
  createCategory: parseAsBoolean,
};
