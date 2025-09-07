"use client";

import { AddAccountButton } from "../bank-connection/add-account-button";
import { Button } from "../ui/button";
import { useEditGroups } from "./edit-groups-context";

export function MainActions() {
  const { editing, setEditing } = useEditGroups();
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={() => setEditing(!editing)}>
        {editing ? "Fine modifica" : "Modifica gruppi"}
      </Button>
      {/* <Button variant="outline">
        <RefreshCcwIcon />
        {tScoped("recalculate")}
      </Button> */}
      <AddAccountButton />
    </div>
  );
}
