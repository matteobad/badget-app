"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useUserMutation, useUserQuery } from "~/hooks/use-user";
import { SlidersHorizontalIcon } from "lucide-react";

export function TrackerSettings() {
  const { data: user } = useUserQuery();
  const userMutation = useUserMutation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SlidersHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={10}>
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Time format
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user?.timeFormat?.toString() ?? "24"}
          onValueChange={(value) => {
            userMutation.mutate({ timeFormat: +value });
          }}
        >
          <DropdownMenuRadioItem value="24">24h</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="12">12h</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Week starts on Monday
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user?.weekStartsOnMonday ? "yes" : "no"}
          onValueChange={(value) => {
            userMutation.mutate({ weekStartsOnMonday: value === "yes" });
          }}
        >
          <DropdownMenuRadioItem value="yes">Yes</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="no">No</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
