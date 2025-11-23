import { z } from "@hono/zod-openapi";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(32).optional().openapi({
    description: "Name of the user. Must be between 2 and 32 characters",
    example: "John Doe",
  }),
  image: z.url().optional().openapi({
    description: "URL to the user's avatar image",
    example: "https://cdn.badget.ai/avatars/johndoe.png",
  }),
  email: z.email().optional().openapi({
    description: "Email address of the user",
    example: "john.doe@example.com",
  }),
  defaultOrganizationId: z.uuid().optional().openapi({
    description: "ID of the user's default organization",
    example: "b3b7c8e2-1d2f-4a5b-9c3e-2a1b2c3d4e5f",
  }),
  locale: z.string().optional().openapi({
    description: "User's locale (e.g. language-country code)",
    example: "en-US",
  }),
  weekStartsOnMonday: z.boolean().optional().openapi({
    description: "Whether the user's week starts on Monday",
    example: true,
    default: true,
  }),
  timezone: z.string().optional().openapi({
    description: "User's timezone (IANA format)",
    example: "Europe/Rome",
  }),
  timezoneAutoSync: z.boolean().optional().openapi({
    description: "Whether the user's timezone is auto-synced",
    example: true,
    default: true,
  }),
  timeFormat: z.number().optional().openapi({
    description: "User's preferred time format (12 or 24)",
    example: 24,
    default: 24,
  }),
  dateFormat: z.string().optional().openapi({
    description: "User's preferred date format",
    example: "YYYY-MM-DD",
  }),
});

export const changeEmailSchema = z.object({
  email: z.email().openapi({
    description: "Email address of the user",
    example: "john.doe@example.com",
  }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string() // check if it is string type
      .min(8, { message: "Password must be at least 8 characters long" }) // checks for character length
      .max(20, { message: "Password must be at most 20 characters long" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" }),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Passwords cannot match",
    path: ["newPassword"],
  });

export const twoFactorSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }) // checks for character length
    .max(20, { message: "Password must be at most 20 characters long" }),
  issuer: z.string().optional(),
});

export const verifyTotpSchema = z.object({
  code: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
  trustDevice: z.boolean(),
});
