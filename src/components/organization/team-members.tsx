// import { Suspense } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// import { DataTable as MembersTable } from "./tables/members";
// import { DataTable as PendingInvitesTable } from "./tables/pending-invites";
// import { PendingInvitesSkeleton } from "./tables/pending-invites/skeleton";

// export function TeamMembers() {
//   return (
//     <Tabs defaultValue="members">
//       <TabsList className="mb-1 h-auto w-full justify-start rounded-none border-b-[1px] bg-transparent p-0 pb-4">
//         <TabsTrigger value="members" className="m-0 mr-4 p-0">
//           Team Members
//         </TabsTrigger>
//         <TabsTrigger value="pending" className="m-0 p-0">
//           Pending Invitations
//         </TabsTrigger>
//       </TabsList>

//       <TabsContent value="members">
//         <Suspense fallback={<PendingInvitesSkeleton />}>
//           <MembersTable />
//         </Suspense>
//       </TabsContent>

//       <TabsContent value="pending">
//         <Suspense fallback={<PendingInvitesSkeleton />}>
//           <PendingInvitesTable />
//         </Suspense>
//       </TabsContent>
//     </Tabs>
//   );
// }
