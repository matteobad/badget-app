"use client";

import type { Table } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { InviteMembersModal } from "./invite-members-modal";

type Props = {
  table?: Table<RouterOutput["space"]["listInvitations"][number]>;
};

export function DataTableHeader({ table }: Props) {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <div className="flex items-center pb-4 space-x-4">
      <Input
        className="flex-1"
        placeholder="Search..."
        value={(table?.getColumn("email")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table?.getColumn("email")?.setFilterValue(event.target.value)
        }
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <Button onClick={() => onOpenChange(true)}>Invite member</Button>
        <InviteMembersModal onOpenChange={onOpenChange} />
      </Dialog>
    </div>
  );
}
