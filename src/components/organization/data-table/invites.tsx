// "use client";

// import {
//   useMutation,
//   useQueryClient,
//   useSuspenseQuery,
// } from "@tanstack/react-query";
// import { SubmitButton } from "~/components/submit-button";
// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
// import { useTRPC } from "~/shared/helpers/trpc/client";

// import { useI18n } from "@/locales/client";

// export function Invites() {
//   const t = useI18n();
//   const trpc = useTRPC();
//   const queryClient = useQueryClient();
//   const { data: invites } = useSuspenseQuery(trpc.user.invites.queryOptions());

//   const declineInviteMutation = useMutation(
//     trpc.organization.declineInvite.mutationOptions({
//       onSuccess: () => {
//         void queryClient.invalidateQueries({
//           queryKey: trpc.user.invites.queryKey(),
//         });

//         void queryClient.invalidateQueries({
//           queryKey: trpc.organization.list.queryKey(),
//         });
//       },
//     }),
//   );

//   const acceptInviteMutation = useMutation(
//     trpc.team.acceptInvite.mutationOptions({
//       onSuccess: () => {
//         queryClient.invalidateQueries({
//           queryKey: trpc.user.invites.queryKey(),
//         });

//         queryClient.invalidateQueries({
//           queryKey: trpc.organization.list.queryKey(),
//         });
//       },
//     }),
//   );

//   if (!invites?.length) {
//     return null;
//   }

//   return (
//     <div className="divide-y border">
//       {invites?.map((invite) => (
//         <div key={invite.id} className="px-4 py-4 align-middle">
//           <div className="flex items-center justify-between space-x-4">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-4">
//                 <Avatar className="h-8 w-8 rounded-full">
//                   <AvatarImage
//                     src={invite.team?.logoUrl ?? ""}
//                     alt={invite.team?.name ?? ""}
//                     width={32}
//                     height={32}
//                   />
//                   <AvatarFallback>
//                     <span className="text-xs">
//                       {invite.team?.name?.charAt(0)?.toUpperCase()}
//                     </span>
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium">
//                     {invite.team?.name}
//                   </span>
//                   <span className="text-sm text-[#606060]">
//                     {/* @ts-expect-error */}
//                     {t(`roles.${invite.role}`)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end">
//               <div className="flex items-center space-x-3">
//                 <SubmitButton
//                   variant="outline"
//                   onClick={() => {
//                     declineInviteMutation.mutate({
//                       id: invite.id,
//                     });
//                   }}
//                   isSubmitting={declineInviteMutation.isPending}
//                 >
//                   Decline
//                 </SubmitButton>
//                 <SubmitButton
//                   variant="outline"
//                   onClick={() => {
//                     acceptInviteMutation.mutate({
//                       id: invite.id,
//                     });
//                   }}
//                   isSubmitting={acceptInviteMutation.isPending}
//                 >
//                   Accept
//                 </SubmitButton>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
