import React from "react";
import { cn } from "~/lib/utils";
import { Wallet2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type AccountAvatarProps = {
  name: string;
  logoUrl: string;
};

export function AccountAvatar({
  account,
  className,
}: React.ComponentPropsWithoutRef<typeof Avatar> & {
  account: AccountAvatarProps;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn("size-5", className)}>
        <AvatarImage
          src={account.logoUrl}
          alt={`${account.name} logo`}
        ></AvatarImage>
        <AvatarFallback>
          <Wallet2Icon className="size-3" />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground">
        {account.name || "Manuale"}
      </span>
    </div>
  );
}
