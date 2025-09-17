"use client";

import { ChangeEmail } from "./change-email";
import { ChangeTheme } from "./change-theme";
import { DeleteAccount } from "./delete-account";
import { DisplayName } from "./display-name";
import { UserAvatar } from "./user-avatar";

export function AccountSettings() {
  return (
    <div className="space-y-12">
      <UserAvatar />
      <DisplayName />
      <ChangeEmail />
      <ChangeTheme />
      <DeleteAccount />
    </div>
  );
}
