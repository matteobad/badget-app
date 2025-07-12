import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createBudget, updateBudget } from "~/server/services/budget-service";
import { validateResponse } from "~/server/services/validation-service";
import {
  budgetResponseSchema,
  createBudgetSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";

import type { Context } from "../init";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create a new budget",
    operationId: "createBudget",
    description: "Create a new budget.",
    tags: ["Budgets"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createBudgetSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Budget created",
        content: {
          "application/json": {
            schema: budgetResponseSchema,
          },
        },
      },
    },
    // middleware: [withRequiredScope("tags.write")],
  }),
  async (c) => {
    const body = c.req.valid("json");
    const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

    const result = await createBudget(body, userId);

    return c.json(validateResponse(result, budgetResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Update a budget",
    operationId: "updateBudget",
    description: "Update a budget by ID.",
    tags: ["Budgets"],
    request: {
      params: updateBudgetSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: updateBudgetSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Budget updated",
        content: {
          "application/json": {
            schema: budgetResponseSchema,
          },
        },
      },
    },
    // middleware: [withRequiredScope("tags.write")],
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

    const result = await updateBudget(body, userId);

    return c.json(validateResponse(result, budgetResponseSchema));
  },
);

export const budgetRouter = app;
