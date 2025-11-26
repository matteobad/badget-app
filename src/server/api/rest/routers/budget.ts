import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { getBudgets, updateBudget } from "~/server/services/budget-service";
import { validateResponse } from "~/server/services/validation-service";
import {
  budgetResponseSchema,
  budgetsResponseSchema,
  getBudgetsSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";

import type { Context } from "../init";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all budgets",
    operationId: "listBudgets",
    description: "Retrieve a list of budgets.",
    tags: ["Budgets"],
    request: {
      query: getBudgetsSchema,
    },
    responses: {
      200: {
        description: "Retrieve a list of budgets.",
        content: {
          "application/json": {
            schema: budgetsResponseSchema,
          },
        },
      },
    },
    // middleware: [withRequiredScope("tags.read")],
  }),
  async (c) => {
    const filters = c.req.valid("query");
    const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

    const result = await getBudgets(filters, userId);

    return c.json(validateResponse({ data: result }, budgetsResponseSchema));
  },
);

// app.openapi(
//   createRoute({
//     method: "post",
//     path: "/",
//     summary: "Create a new budget",
//     operationId: "createBudget",
//     description: "Create a new budget.",
//     tags: ["Budgets"],
//     request: {
//       body: {
//         content: {
//           "application/json": {
//             schema: createBudgetSchema,
//           },
//         },
//       },
//     },
//     responses: {
//       201: {
//         description: "Budget created",
//         content: {
//           "application/json": {
//             schema: budgetResponseSchema,
//           },
//         },
//       },
//     },
//     // middleware: [withRequiredScope("tags.write")],
//   }),
//   async (c) => {
//     const body = c.req.valid("json");
//     const userId = "user_2jnV56cv1CJrRNLFsUdm6XAf7GD";

//     const result = await createBudget(body, userId);

//     return c.json(validateResponse(result, budgetResponseSchema));
//   },
// );

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
            schema: updateBudgetSchema.omit({ id: true }),
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

    const result = await updateBudget({ ...body, id }, userId);

    return c.json(validateResponse(result, budgetResponseSchema));
  },
);

export const budgetRouter = app;
