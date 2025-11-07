"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { InviteForm } from "./invite-form";

type InviteTeamMembersModalProps = {
  onOpenChange: (open: boolean) => void;
};

export function InviteMembersModal({
  onOpenChange,
}: InviteTeamMembersModalProps) {
  return (
    <DialogContent className="max-w-[455px]">
      <div className="p-4">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite new members by email address.
          </DialogDescription>
        </DialogHeader>

        <InviteForm onSuccess={() => onOpenChange(false)} skippable={false} />
      </div>
    </DialogContent>
  );
}
