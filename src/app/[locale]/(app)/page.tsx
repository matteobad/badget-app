import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import CSVUploader from "~/components/csv-uploader/csv-uploader";
import { CACHED_QUERIES } from "~/server/db/queries/cached-queries";

export default async function Page() {
  const session = await auth();

  if (!session.userId) {
    // TODO: better auth check
    console.error("Not authorized");
    redirect("/sign-in");
  }

  const accounts = await CACHED_QUERIES.getAccountsForUser(session.userId);

  return <CSVUploader accounts={accounts} />;
}
