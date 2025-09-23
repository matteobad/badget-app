import type {
  createOrganizationSchema,
  deleteSpaceSchema,
  updateSpaceByIdSchema,
} from "~/shared/validators/organization.schema";
import type z from "zod";
import { headers } from "next/headers";
import { schedules } from "@trigger.dev/sdk";

import type { DBClient } from "../db";
import { auth } from "../../shared/helpers/better-auth/auth";
import { createDefaultCategoriesForSpace } from "../domain/transaction-category/mutations";
import { getUserByIdQuery } from "../domain/user/queries";
import { getBankAccountProvider } from "../integrations/open-banking";
import { bankSyncScheduler } from "../jobs/tasks/bank-sync-scheduler";
import { getBankConnections } from "./bank-connection-service";

export async function getUserById(db: DBClient, id: string) {
  return await getUserByIdQuery(db, id);
}

export async function getSpaceById(organizationId: string) {
  const data = await auth.api.getFullOrganization({
    query: {
      organizationId,
      membersLimit: 100,
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  return data;
}

export async function updateSpaceById(
  params: z.infer<typeof updateSpaceByIdSchema>,
  organizationId: string,
) {
  const data = await auth.api.updateOrganization({
    body: {
      data: {
        ...params,
        ...(params.logoUrl ? { logo: params.logoUrl } : {}),
      },
      organizationId,
    },
    // This endpoint requires session cookies.
    headers: await headers(),
  });

  return data;
}

export async function createOrganization(
  db: DBClient,
  input: z.infer<typeof createOrganizationSchema>,
  userId: string,
) {
  try {
    // Create organization
    const newOrg = await auth.api.createOrganization({
      body: {
        name: input.name, // required
        slug: input.name.toLocaleLowerCase().replaceAll(" ", "-"), // required
        logo: input.logoUrl,
        userId: userId, // server-only
        keepCurrentActiveOrganization: false,
        baseCurrency: input.baseCurrency,
        countryCode: input.countryCode,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    if (!newOrg?.id) {
      throw new Error("Failed to create space.");
    }

    // Create system categories for the new team
    await createDefaultCategoriesForSpace(db, { organizationId: newOrg.id });

    // Optionally switch user to the new team
    if (input.switchSpace) {
      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: newOrg.id,
        },
      });

      // Update user active space
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          defaultOrganizationId: newOrg.id,
        },
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create space.");
  }
}

export async function deleteOrganization(
  input: z.infer<typeof deleteSpaceSchema>,
) {
  try {
    // Delete organization
    const deletedOrg = await auth.api.deleteOrganization({
      body: {
        organizationId: input.id,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    if (!deletedOrg) {
      throw new Error("Failed to delete space.");
    }

    // Getting bank connection
    const bankConnections = await getBankConnections({}, input.id);

    // Delete connections in providers
    const provider = getBankAccountProvider("gocardless");
    const connectionPromises = bankConnections.map(async (connection) => {
      return provider.deleteConnection({
        id: connection.referenceId!,
      });
    });

    console.info("Deleting space connections", {
      connections: bankConnections.length,
    });

    await Promise.all(connectionPromises);

    // Unregister bank sync scheduler by deduplication key
    if (process.env.TRIGGER_ENVIRONMENT !== "production") return;
    await schedules.del(`${input.id}-${bankSyncScheduler.id}`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete space.");
  }
}
