import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import SyncConnection from "~/features/account/components/sync-connection";
import {
  getConnectionByKey,
  getInstitutionById,
} from "~/features/account/server/queries";
import { auth } from "~/server/auth/auth";

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<{ ref: string; provider: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const conn = await getConnectionByKey(params.ref);
  if (!conn) throw new Error("Connection not found");
  if (conn.userId !== session.user.id) throw new Error("User not authorized");

  const institution = await getInstitutionById(conn.institutionId);

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
        {institution[0]!.name} è stato collegato con successo
      </p>
      <SyncConnection id={params.ref} />
    </div>
  );
}
