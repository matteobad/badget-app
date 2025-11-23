"use client";

import { LifeBuoyIcon, LogOut, UserIcon, UsersIcon } from "lucide-react";
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
import { authClient } from "~/shared/helpers/better-auth/auth-client";
import { getInitials } from "~/shared/helpers/format";

import { ThemeSelect } from "./theme-select";
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
        <Avatar className="h-8 w-8 rounded-none">
          <AvatarImage src={data.image ?? ""} alt={`avatar of ${data.name}`} />
          <AvatarFallback className="rounded-none">
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
            <Avatar className="h-8 w-8 rounded-none">
              <AvatarImage
                className="rounded-none"
                src={data.image ?? ""}
                alt={`avatar of ${data.name}`}
              />
              <AvatarFallback className="rounded-none">
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
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserIcon />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/support">
              <LifeBuoyIcon />
              Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/spaces">
              <UsersIcon />
              Spaces
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex flex-row items-center justify-between p-2">
          <p className="text-sm">Theme</p>
          <ThemeSelect />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void authClient.signOut({
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
