import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getCategoriesWithBudgets } from "~/server/services/category-service";
import { getCategoriesWithBudgetsSchema } from "~/shared/validators/category.schema";

import type { Context } from "../init";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all categories with budgets",
    operationId: "listCategoriesWithBudgets",
    description: "Retrieve a list of categories with budgets.",
    tags: ["Categories"],
    request: {
      query: getCategoriesWithBudgetsSchema,
    },
    responses: {
      200: {
        description: "Retrieve a list of categories with budgets.",
        // content: {
        //   "application/json": {
        //     schema: todosResponseSchema,
        //   },
        // },
      },
    },
    // middleware: [withRequiredScope("tags.read")],
  }),
  async (c) => {
    const filters = c.req.valid("query");
    const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

    const result = await getCategoriesWithBudgets(filters, userId);

    return c.json({ data: result });
  },
);

export const categoryRouter = app;
