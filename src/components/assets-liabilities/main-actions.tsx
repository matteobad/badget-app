"use client";

import { AddAccountButton } from "../bank-connection/add-account-button";

export function MainActions() {
  return (
    <div className="flex items-center gap-4">
      {/* <Button variant="outline">
        <RefreshCcwIcon />
        {tScoped("recalculate")}
      </Button> */}
      <AddAccountButton />
    </div>
  );
}
