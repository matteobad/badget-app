import { z } from "@hono/zod-openapi";

export const updateSpaceByIdSchema = z.object({
  name: z.string().min(2).max(32).optional().openapi({
    description:
      "Name of the team or organization. Must be between 2 and 32 characters",
    example: "Acme Corporation",
  }),
  email: z.email().optional().openapi({
    description: "Primary contact email address for the team",
    example: "team@acme.com",
  }),
  logoUrl: z.url().optional().openapi({
    description:
      "URL to the space's logo image. Must be hosted on badget.ai domain",
    example: "https://cdn.badget.ai/logos/acme-corp.png",
  }),
  baseCurrency: z.string().optional().openapi({
    description:
      "Base currency for the team in ISO 4217 format (3-letter currency code)",
    example: "USD",
  }),
  countryCode: z.string().optional().openapi({
    description: "Country code for the team",
    example: "US",
  }),
});

export const createOrganizationSchema = z.object({
  name: z.string().openapi({
    description: "Name of the organization",
    example: "Acme Corporation",
  }),
  baseCurrency: z.string().openapi({
    description:
      "Base currency for the team in ISO 4217 format (3-letter currency code)",
    example: "USD",
  }),
  countryCode: z.string().optional().openapi({
    description: "Country code for the organization",
    example: "US",
  }),
  logoUrl: z.url().optional().openapi({
    description: "URL to the org's logo image",
    example: "https://cdn.midday.ai/logos/acme-corp.png",
  }),
  switchSpace: z.boolean().optional().openapi({
    description: "Whether to switch the user to the new space after creation",
    example: true,
  }),
});

export const deleteSpaceSchema = z.object({
  id: z.uuid().openapi({
    description: "id of the space",
    example: "Acme Corporation",
  }),
});

export const setActiveOrganizationSchema = z.object({
  organizationId: z.string().openapi({
    description: "Name of the organization",
    example: "Acme Corporation",
  }),
  organizationSlug: z.string().optional().openapi({
    description:
      "Base currency for the team in ISO 4217 format (3-letter currency code)",
    example: "USD",
  }),
});
