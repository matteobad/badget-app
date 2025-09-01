"use client";

import { RefreshCcwIcon } from "lucide-react";

import { AddAccountButton } from "../bank-connection/add-account-button";
import { Button } from "../ui/button";

export function MainActions() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline">
        <RefreshCcwIcon />
        Recalculate balances
      </Button>
      <AddAccountButton />
    </div>
  );
}
