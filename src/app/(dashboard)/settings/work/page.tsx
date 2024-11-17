import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { Button } from "~/components/ui/button";
import { db, schema } from "~/server/db";
import { CreateWorkForm } from "../_components/create-work-form";
import WorkForm from "../_components/work-form";

async function findAllWorkRecord() {
  const session = auth();

  if (!session.userId) return [];

  return await db
    .select()
    .from(schema.works)
    .where(eq(schema.works.userId, session.userId));
}

export default async function WorkAccountPage(
  props: {
    searchParams: Promise<Record<string, string | string[]>>;
  }
) {
  const searchParams = await props.searchParams;
  const workRecords = await findAllWorkRecord();
  const { action } = searchParams;

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex items-end justify-between gap-16">
        <header className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">Working Situation</h3>
          <p className="text-sm text-muted-foreground">
            Update your working situation. This will help us make more precise
            forecasting on your net worth. It is also used to calculate pension
            contributions.
          </p>
        </header>
        <div className="flex gap-2">
          <Button variant="outline">Import from LinkedIn</Button>
        </div>
      </div>
      {workRecords.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          {action !== "create" ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no working record
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start as soon as you add a working record.
              </p>
              <Button className="mt-4">
                <Link href="/account/work?action=create">Add Work Record</Link>
              </Button>
            </div>
          ) : (
            <CreateWorkForm />
          )}
        </div>
      ) : (
        <WorkForm />
      )}
    </div>
  );
}
