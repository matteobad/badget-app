"use client";

import * as React from "react";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { CreateTeamModal } from "./create-team-modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();

  const { user } = useUser();
  const { organization } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
      limit: 5,
    },
  });

  const [isCreatingOrg, setIsCreatingOrg] = React.useState(false);

  if (!isLoaded) {
    return (
      <div className="flex h-12 w-full items-center gap-2 p-2">
        <Skeleton className="rouded size-8" />
        <div className="flex flex-grow flex-col gap-1">
          <Skeleton className="rouded h-4 w-[80px]" />
          <Skeleton className="rouded h-3 w-[50px]" />
        </div>
        <Skeleton className="rouded size-4" />
      </div>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={organization?.imageUrl ?? user?.imageUrl}
                      alt={`avatar of ${organization?.name ?? user?.imageUrl}`}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {organization?.name ?? user?.firstName}
                  </span>
                  <span className="truncate text-xs">{"Free plan"}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Spazio Personale
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setActive({ organization: null })}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Avatar className="size-6 shrink-0 rounded-sm">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={`avatar of ${user?.fullName}`}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                </div>
                {user?.fullName}
                <DropdownMenuShortcut>⌘{0}</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Gruppi
              </DropdownMenuLabel>
              {userMemberships.data?.map(({ organization }, index) => (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => setActive({ organization: organization.id })}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm">
                    <Avatar className="size-6 shrink-0 rounded-sm">
                      <AvatarImage
                        src={organization?.imageUrl}
                        alt={`avatar of ${organization?.name}`}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                  </div>
                  {organization.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsCreatingOrg(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Crea gruppo
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateTeamModal open={isCreatingOrg} onOpenChange={setIsCreatingOrg} />
    </>
  );
}
