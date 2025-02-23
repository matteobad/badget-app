import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { auth } from "@clerk/nextjs/server";

import { ErrorFallback } from "~/components/error-fallback";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  getConnectionByKey,
  getInstitutionById,
} from "~/features/open-banking/server/queries";
import ImportData, {
  SyncDataLoading,
} from "../../../../../features/open-banking/components/sync-data.server";

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<{ ref: string; provider: string }>;
}) {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const params = await searchParams;
  const conn = await getConnectionByKey(params.ref);
  if (!conn[0]) throw new Error("Connection not found");
  if (conn[0].userId !== session.userId) throw new Error("User not authorized");

  const institution = await getInstitutionById(conn[0].institutionId);

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col justify-center p-4 text-center">
      <div className="mb-4 flex justify-center">
        <Avatar className="h-12 w-12 text-green-500">
          <AvatarImage
            src={institution[0]!.logo!}
            alt={`${institution[0]!.name} logo`}
            className="rounded-none"
          />
          <AvatarFallback>BK</AvatarFallback>
        </Avatar>
      </div>
      <h1 className="mb-2 text-2xl font-semibold">Collegamento riuscito!</h1>
      <p className="mb-6 text-muted-foreground">
        {institution[0]!.name} è stato collegati con successo
      </p>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<SyncDataLoading />}>
          <ImportData
            id={params.ref}
            provider={params.provider}
            connectionId={conn[0].id}
            institutionId={institution[0]!.id}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
