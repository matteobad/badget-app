"use client";

import { VaultGrid } from "./vault-grid";

export function VaultView() {
  // const { params } = useDocumentParams();

  return (
    // <VaultUploadZone>
    // {/* {params.view === "grid" ? <VaultGrid /> : <DataTable />} */}
    <VaultGrid />
    // </VaultUploadZone>
  );
}
