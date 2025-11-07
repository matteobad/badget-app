import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTable as PendingInvitesTable } from "./invitations-data-table";
import { DataTable as MembersTable } from "./members-data-table";

export function TeamMembers() {
  return (
    <Tabs defaultValue="members">
      <TabsList className="bg-transparent border-b-[1px] w-full justify-start rounded-none mb-1 p-0 h-auto pb-4">
        <TabsTrigger value="members" className="p-0 m-0 mr-4">
          Team Members
        </TabsTrigger>
        <TabsTrigger value="pending" className="p-0 m-0">
          Pending Invitations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="members">
        <Suspense fallback={<DataTableSkeleton />}>
          <MembersTable />
        </Suspense>
      </TabsContent>

      <TabsContent value="pending">
        <Suspense fallback={<DataTableSkeleton />}>
          <PendingInvitesTable />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
