import { auth } from "@clerk/nextjs/server";

import { QUERIES } from "~/server/db/queries";
import AccountDataTable from "./_components/accounts-table";

export default async function SettingsAccountsPage() {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const connections = await QUERIES.getAccountsWithConnectionsForUser(
    session.userId,
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AccountDataTable connections={connections} />
      </div>
    </>
  );
}
