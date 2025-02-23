"use client";

import { useMemo } from "react";
import { useQueryStates } from "nuqs";

import { AccountAvatar } from "~/components/account-avatar";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { type getConnectionsWithAccountsForUser } from "../server/queries";
import { connectionsParsers } from "../utils/search-params";
import UpdateConnectionForm from "./update-connection-form";

type ConnectionWithAccounts = Awaited<
  ReturnType<typeof getConnectionsWithAccountsForUser>
>[number];

export default function UpdateConnectionDrawerSheet({
  connections,
}: {
  connections: ConnectionWithAccounts[];
}) {
  const [{ id }, setParams] = useQueryStates(connectionsParsers);
  const isMobile = useIsMobile();

  const open = !!id;

  const connection = useMemo(() => {
    return connections.find((t) => t.id === id);
  }, [id, connections]);

  const handleClose = () => {
    void setParams({ id: null });
  };

  if (!connection) return;

  const DrawerSheetContent = () => (
    <>
      <div className="mb-8 flex justify-between">
        <AccountAvatar
          account={{
            name: connection.institution?.name ?? "",
            logoUrl: connection.institution?.logo ?? "",
          }}
        />
        <div className="text-sm text-muted-foreground">
          {connection.provider.toLowerCase()}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <h2>{connection.institution.provider}</h2>
        <span className="font-mono text-4xl">
          {connection.institution.name}
        </span>
      </div>

      <UpdateConnectionForm
        className={cn({ "px-4": isMobile })}
        connection={connection}
        onComplete={handleClose}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Modifica spesa o entrata</DrawerTitle>
            <DrawerDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerSheetContent />
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" asChild>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="p-4 [&>button]:hidden">
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Modifica spesa o entrate</SheetTitle>
            <SheetDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>
          <DrawerSheetContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
