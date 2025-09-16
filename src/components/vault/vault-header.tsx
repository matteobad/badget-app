"use client";

import { VaultActions } from "./vault-actions";
import { VaultSearchFilter } from "./vault-search-filter";

export function VaultHeader() {
  return (
    <div className="flex justify-between p-6">
      <VaultSearchFilter />
      <VaultActions />
    </div>
  );
}
