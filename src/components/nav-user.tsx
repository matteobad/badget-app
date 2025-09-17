"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useUserQuery } from "~/hooks/use-user";
import { signOut } from "~/shared/helpers/better-auth/auth-client";
import { getInitials } from "~/shared/helpers/format";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";

import { Skeleton } from "./ui/skeleton";

export function NavUser() {
  const router = useRouter();
  const { data, isLoading } = useUserQuery();

  if (!data || isLoading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-auto">
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage src={data.image ?? ""} alt={`avatar of ${data.name}`} />
          <AvatarFallback className="rounded-full">
            {getInitials(data.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={data.image ?? ""}
                alt={`avatar of ${data.name}`}
              />
              <AvatarFallback className="rounded-lg">
                {getInitials(data.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{data.name}</span>
              <span className="truncate text-xs">{data.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <BadgeCheck />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/sign-in"); // redirect to login page
                },
              },
            });
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
