import { auth } from "@clerk/nextjs/server";

import CreateAccountDrawerSheet from "~/features/account/components/create-account-drawer-sheet";
import ConnectionDataTable from "~/features/open-banking/components/connection-data-table";
import UpdateConnectionDrawerSheet from "~/features/open-banking/components/update-connection-drawer-sheet";
import { getConnectionsWithAccountsForUser } from "~/features/open-banking/server/queries";

export default async function SettingsAccountsPage() {
  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const connections = await getConnectionsWithAccountsForUser(session.userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ConnectionDataTable connections={connections} />
      </div>

      <CreateAccountDrawerSheet />
      <UpdateConnectionDrawerSheet connections={connections} />
    </>
  );
}
