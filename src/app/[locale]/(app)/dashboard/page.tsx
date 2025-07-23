import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">TODO</div>
      </div>
    </>
  );
}
