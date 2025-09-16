"use client";

import { VaultUploadButton } from "./vault-upload-button";
import { VaultViewSwitch } from "./vault-view-switch";

export function VaultActions() {
  return (
    <div className="hidden space-x-2 md:flex">
      <VaultViewSwitch />
      <VaultUploadButton />
    </div>
  );
}
