"use client";

import { useScopedI18n } from "~/shared/locales/client";
import { RefreshCcwIcon } from "lucide-react";

import { AddAccountButton } from "../bank-connection/add-account-button";
import { Button } from "../ui/button";

export function MainActions() {
  const tScoped = useScopedI18n("account.actions");

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline">
        <RefreshCcwIcon />
        {tScoped("recalculate")}
      </Button>
      <AddAccountButton />
    </div>
  );
}
