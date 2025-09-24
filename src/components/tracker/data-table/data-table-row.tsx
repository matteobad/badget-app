// "use client";

// import Link from "next/link";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "~/components/ui/alert-dialog";
// import { Avatar, AvatarFallback } from "~/components/ui/avatar";
// import { Badge } from "~/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "~/components/ui/dropdown-menu";
// import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
// import { TableCell, TableRow } from "~/components/ui/table";
// import { useTrackerParams } from "~/hooks/use-tracker-params";
// import { useUserQuery } from "~/hooks/use-user";
// import {
//   formatAmount,
//   secondsToHoursAndMinutes,
// } from "~/shared/helpers/format";

// type DataTableCellProps = {
//   children: React.ReactNode;
//   className?: string;
//   onClick?: () => void;
// };

// export function DataTableCell({
//   children,
//   className,
//   onClick,
// }: DataTableCellProps) {
//   return (
//     <TableCell className={className} onClick={onClick}>
//       {children}
//     </TableCell>
//   );
// }

// type RowProps = {
//   children: React.ReactNode;
// };

// export function Row({ children }: RowProps) {
//   return (
//     <TableRow className="group h-[45px] hover:bg-[#F2F1EF] hover:dark:bg-secondary">
//       {children}
//     </TableRow>
//   );
// }

// type DataTableRowProps = {
//   row: RouterOutputs["trackerProjects"]["get"]["data"][number];
//   onDelete: ({ id }: { id: string }) => void;
// };

// export function DataTableRow({ row, onDelete }: DataTableRowProps) {
//   const { setParams } = useTrackerParams();
//   const { data: user } = useUserQuery();

//   const onClick = () => {
//     setParams({
//       projectId: row.id,
//       update: true,
//     });
//   };

//   return (
//     <AlertDialog>
//       <DropdownMenu>
//         <Row>
//           <DataTableCell className="z-20 w-[420px] min-w-[420px] border-r border-border bg-background group-hover:bg-[#F2F1EF] before:absolute before:top-0 before:right-0 before:bottom-0 before:w-px before:bg-border after:absolute after:top-0 after:right-[-24px] after:bottom-0 after:z-[-1] after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background group-hover:after:to-muted md:sticky md:left-0 group-hover:dark:bg-secondary">
//             <TrackerTimer
//               projectId={row.id}
//               projectName={row.name}
//               onClick={onClick}
//             />
//           </DataTableCell>
//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             {row.customer ? (
//               <div className="flex items-center space-x-2">
//                 <Avatar className="size-5">
//                   {row.customer?.website && (
//                     <AvatarImageNext
//                       src={getWebsiteLogo(row.customer?.website)}
//                       alt={`${row.customer?.name} logo`}
//                       width={20}
//                       height={20}
//                       quality={100}
//                     />
//                   )}
//                   <AvatarFallback className="text-[9px] font-medium">
//                     {row.customer?.name?.[0]}
//                   </AvatarFallback>
//                 </Avatar>
//                 <span className="truncate">{row.customer?.name}</span>
//               </div>
//             ) : (
//               "-"
//             )}
//           </DataTableCell>

//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             <span className="text-sm">
//               {row.estimate
//                 ? `${secondsToHoursAndMinutes(row.totalDuration ?? 0)} / ${secondsToHoursAndMinutes(row.estimate * 3600)}`
//                 : secondsToHoursAndMinutes(row.totalDuration ?? 0)}
//             </span>
//           </DataTableCell>
//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             {row.currency ? (
//               <span className="text-sm">
//                 {formatAmount({
//                   currency: row.currency,
//                   amount: row.totalAmount ?? 0,
//                   minimumFractionDigits: 0,
//                   maximumFractionDigits: 0,
//                   locale: user?.locale,
//                 })}
//               </span>
//             ) : (
//               "-"
//             )}
//           </DataTableCell>
//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             {row.description}
//           </DataTableCell>
//           <DataTableCell>
//             <div className="relative">
//               <ScrollArea className="w-[170px] whitespace-nowrap">
//                 <div className="flex items-center space-x-2">
//                   {row.tags?.map((tag) => (
//                     <Link href={`/transactions?tags=${tag.id}`} key={tag.id}>
//                       <Badge
//                         variant="tag-rounded"
//                         className="whitespace-nowrap"
//                       >
//                         {tag.name}
//                       </Badge>
//                     </Link>
//                   ))}
//                 </div>

//                 <ScrollBar orientation="horizontal" />
//               </ScrollArea>

//               <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent group-hover:hidden" />
//             </div>
//           </DataTableCell>
//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             <div className="flex items-center space-x-2">
//               {row.users?.map((user) => (
//                 <Avatar key={user.id} className="size-4">
//                   <AvatarImageNext
//                     src={user.avatarUrl}
//                     alt={user.fullName ?? ""}
//                     width={20}
//                     height={20}
//                   />
//                   <AvatarFallback className="text-[10px]">
//                     {user.fullName?.slice(0, 1)?.toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//               ))}
//             </div>
//           </DataTableCell>
//           <DataTableCell onClick={onClick} className="cursor-pointer">
//             <TrackerStatus status={row.status} />
//           </DataTableCell>
//           <DataTableCell className="z-30 bg-background group-hover:bg-[#F2F1EF] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border after:absolute after:top-0 after:bottom-0 after:left-[-24px] after:z-[-1] after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background group-hover:after:to-muted md:sticky md:right-0 group-hover:dark:bg-secondary">
//             <div className="flex justify-center">
//               <DropdownMenuTrigger>
//                 <Icons.MoreHoriz />
//               </DropdownMenuTrigger>
//             </div>
//           </DataTableCell>
//         </Row>

//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete this
//               project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={() => onDelete({ id: row.id })}>
//               Continue
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>

//         <DropdownMenuContent className="w-42" sideOffset={10} align="end">
//           <DropdownMenuItem
//             onClick={() => setParams({ update: true, projectId: row.id })}
//           >
//             Edit
//           </DropdownMenuItem>

//           <TrackerCreateInvoice projectId={row.id} projectName={row.name} />

//           <TrackerExportCSV name={row.name} projectId={row.id} />

//           <DropdownMenuSeparator />

//           <AlertDialogTrigger asChild>
//             <DropdownMenuItem className="text-destructive">
//               Delete
//             </DropdownMenuItem>
//           </AlertDialogTrigger>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </AlertDialog>
//   );
// }
