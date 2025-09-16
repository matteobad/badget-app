"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "../ui/button";

export function VaultUploadButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => document.getElementById("upload-files")?.click()}
    >
      <PlusIcon size={17} />
    </Button>
  );
}
