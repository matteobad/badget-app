// "use client";

// import { HorizontalPagination } from "~/components/horizontal-pagination";
// import { Button } from "~/components/ui/button";
// import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
// import { useSortParams } from "~/hooks/use-sort-params";
// import { cn } from "~/lib/utils";
// import { ArrowDown, ArrowUp } from "lucide-react";

// interface Props {
//   tableScroll?: {
//     canScrollLeft: boolean;
//     canScrollRight: boolean;
//     isScrollable: boolean;
//     scrollLeft: () => void;
//     scrollRight: () => void;
//   };
// }

// export function DataTableHeader({ tableScroll }: Props) {
//   const { params, setParams } = useSortParams();

//   const [column, value] = params.sort || [];

//   const createSortQuery = (name: string) => {
//     const [currentColumn, currentValue] = params.sort || [];

//     if (name === currentColumn) {
//       if (currentValue === "asc") {
//         setParams({ sort: [name, "desc"] });
//       } else if (currentValue === "desc") {
//         setParams({ sort: null });
//       } else {
//         setParams({ sort: [name, "asc"] });
//       }
//     } else {
//       setParams({ sort: [name, "asc"] });
//     }
//   };

//   return (
//     <TableHeader className="border-r-0 border-l-0">
//       <TableRow className="h-[45px]">
//         <TableHead className="z-20 w-[420px] min-w-[420px] border-r border-border bg-background before:absolute before:top-0 before:right-0 before:bottom-0 before:w-px before:bg-border after:absolute after:top-0 after:right-[-24px] after:bottom-0 after:z-[-1] after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background md:sticky md:left-0">
//           <div className="flex items-center justify-between">
//             <Button
//               className="space-x-2 p-0 hover:bg-transparent"
//               variant="ghost"
//               onClick={() => createSortQuery("name")}
//             >
//               <span>Project</span>
//               {"name" === column && value === "asc" && <ArrowDown size={16} />}
//               {"name" === column && value === "desc" && <ArrowUp size={16} />}
//             </Button>
//             {tableScroll?.isScrollable && (
//               <HorizontalPagination
//                 canScrollLeft={tableScroll.canScrollLeft}
//                 canScrollRight={tableScroll.canScrollRight}
//                 onScrollLeft={tableScroll.scrollLeft}
//                 onScrollRight={tableScroll.scrollRight}
//                 className="ml-auto hidden md:flex"
//               />
//             )}
//           </div>
//         </TableHead>
//         <TableHead className="w-[180px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("customer")}
//           >
//             <span>Customer</span>
//             {"customer" === column && value === "asc" && (
//               <ArrowDown size={16} />
//             )}
//             {"customer" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>

//         <TableHead className="w-[180px] min-w-[180px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("time")}
//           >
//             <span>Total Time</span>
//             {"time" === column && value === "asc" && <ArrowDown size={16} />}
//             {"time" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>
//         <TableHead className="w-[190px] min-w-[190px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("amount")}
//           >
//             <span>Total Amount</span>
//             {"amount" === column && value === "asc" && <ArrowDown size={16} />}
//             {"amount" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>
//         <TableHead className="w-[200px] min-w-[200px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("description")}
//           >
//             <span className="line-clamp-1 text-ellipsis">Description</span>
//             {"description" === column && value === "asc" && (
//               <ArrowDown size={16} />
//             )}
//             {"description" === column && value === "desc" && (
//               <ArrowUp size={16} />
//             )}
//           </Button>
//         </TableHead>

//         <TableHead className="min-w-[170px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("tags")}
//           >
//             <span>Tags</span>
//             {"tags" === column && value === "asc" && <ArrowDown size={16} />}
//             {"tags" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>

//         <TableHead className="w-[140px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("assigned")}
//           >
//             <span>Assigned</span>
//             {"assigned" === column && value === "asc" && (
//               <ArrowDown size={16} />
//             )}
//             {"assigned" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>
//         <TableHead className="w-[150px] min-w-[150px]">
//           <Button
//             className="space-x-2 p-0 hover:bg-transparent"
//             variant="ghost"
//             onClick={() => createSortQuery("status")}
//           >
//             <span>Status</span>
//             {"status" === column && value === "asc" && <ArrowDown size={16} />}
//             {"status" === column && value === "desc" && <ArrowUp size={16} />}
//           </Button>
//         </TableHead>
//         <TableHead
//           className={cn(
//             "z-30 w-[100px] bg-background md:sticky md:right-0",
//             "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-border",
//             "after:absolute after:top-0 after:bottom-0 after:left-[-24px] after:z-[-1] after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background",
//           )}
//         >
//           Actions
//         </TableHead>
//       </TableRow>
//     </TableHeader>
//   );
// }
