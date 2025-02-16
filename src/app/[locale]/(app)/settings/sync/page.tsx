import { auth } from "@clerk/nextjs/server";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { QUERIES } from "~/server/db/queries";
import ImportData from "./import-data";

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<{ ref: string; provider: string }>;
}) {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const params = await searchParams;

  const conn = await QUERIES.getConnectionByKey(params.ref);
  const institution = await QUERIES.getInstitutionById(conn[0]!.institutionId);

  console.log(conn, institution);

  return (
    <div className="mx-auto max-w-2xl p-4 text-center">
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
      <h1 className="mb-2 text-2xl font-semibold">Banca Collegata!</h1>
      <p className="mb-6 text-muted-foreground">
        I tuoi conti sono stati collegati con successo
      </p>
      <ImportData
        id={params.ref}
        provider={params.provider}
        connectionId={conn[0]!.id}
        institutionId={institution[0]!.id}
        institutionLogo={institution[0]!.logo!}
      />
    </div>
  );
}
