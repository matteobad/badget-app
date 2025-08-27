import { z } from "@hono/zod-openapi";
import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/shared/constants/enum";
import { parseAsBoolean, parseAsString } from "nuqs/server";

export const getBankAccountsSchema = z.object({
  id: z
    .string()
    .optional()
    .openapi({
      description: "GoCardLess reference id",
      param: {
        name: "id",
        in: "query",
      },
      example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    }),
  provider: z
    .enum(BANK_PROVIDER)
    .openapi({
      example: BANK_PROVIDER.GOCARDLESS,
    })
    .optional(),
  institutionId: z
    .string()
    .optional()
    .openapi({
      description: "GoCardLess institution id",
      param: {
        name: "institutionId",
        in: "query",
      },
      example: "ins_109508",
    }),
  enabled: z.boolean().optional(),
  manual: z.boolean().optional(),
});

export const deleteBankAccountSchema = z.object({
  id: z.uuid().openapi({
    description: "The unique identifier of the bank account.",
    example: "b7e6c2a0-1f2d-4c3b-9a8e-123456789abc",
    param: {
      in: "path",
      name: "id",
    },
  }),
});

export const getBankAccountByIdSchema = z.object({
  id: z.uuid().openapi({
    description: "The unique identifier of the bank account.",
    example: "b7e6c2a0-1f2d-4c3b-9a8e-123456789abc",
    param: {
      in: "path",
      name: "id",
    },
  }),
});

export const createManualBankAccountSchema = z
  .object({
    name: z.string().openapi({
      description: "The name of the bank account.",
      example: "Checking Account",
    }),
    balance: z.number().openapi({
      description: "Current balance of the bank account.",
      example: 1500.75,
    }),
    currency: z.string().openapi({
      description: "The currency code for the bank account (ISO 4217).",
      example: "USD",
    }),
    type: z.enum(ACCOUNT_TYPE).optional().openapi({
      description: "Type of the bank account.",
      example: "depository",
    }),
  })
  .openapi({
    description: "Schema for updating a bank account.",
    example: {
      id: "b7e6c2a0-1f2d-4c3b-9a8e-123456789abc",
      name: "Checking Account",
      enabled: true,
      balance: 1500.75,
      type: "depository",
    },
  });

export const updateBankAccountSchema = z
  .object({
    id: z.uuid().openapi({
      description: "The unique identifier of the bank account.",
      example: "b7e6c2a0-1f2d-4c3b-9a8e-123456789abc",
    }),
    name: z.string().optional().openapi({
      description: "The name of the bank account.",
      example: "Checking Account",
    }),
    description: z.string().optional().openapi({
      description: "The description of the bank account.",
      example: "Revolut space for annual expeses.",
    }),
    enabled: z.boolean().optional().openapi({
      description: "Whether the bank account is enabled.",
      example: true,
    }),
    balance: z.number().optional().openapi({
      description: "Current balance of the bank account.",
      example: 1500.75,
    }),
    currency: z.string().optional().openapi({
      description: "The currency code for the bank account (ISO 4217).",
      example: "USD",
    }),
    type: z.enum(ACCOUNT_TYPE).optional().openapi({
      description: "Type of the bank account.",
      example: "depository",
    }),
  })
  .openapi({
    description: "Schema for updating a bank account.",
    example: {
      id: "b7e6c2a0-1f2d-4c3b-9a8e-123456789abc",
      name: "Checking Account",
      enabled: true,
      balance: 1500.75,
      type: "depository",
    },
  });

// Search params for sheets
export const bankAccountParamsSchema = {
  bankAccountId: parseAsString,
  createBankAccount: parseAsBoolean,
};
