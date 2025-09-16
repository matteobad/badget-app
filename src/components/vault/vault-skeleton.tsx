"use client";

// import { useDocumentParams } from "~/hooks/use-document-params";
import { VaultGridSkeleton } from "./vault-grid-skeleton";

export function VaultSkeleton() {
  // const { params } = useDocumentParams();

  // if (params.view === "grid") {
  return <VaultGridSkeleton />;
  // }

  // return <DataTableSkeleton />;
}
