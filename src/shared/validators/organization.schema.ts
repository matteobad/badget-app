import { z } from "@hono/zod-openapi";

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
