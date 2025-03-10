"use client";

import { use } from "react";
import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { actionsParsers } from "~/utils/search-params";
import { type getConnectionsForUser_CACHED } from "../server/cached-queries";
import ConnectionsList from "./connections-list";

interface UpdateConnectionsDrawerDialogProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  promise: Promise<[Awaited<ReturnType<typeof getConnectionsForUser_CACHED>>]>;
}

export default function ManageConnectionsDrawerDialog({
  promise,
}: UpdateConnectionsDrawerDialogProps) {
  const isMobile = useIsMobile();

  const [{ action }, setParams] = useQueryStates(actionsParsers);

  const open = action === "manage-connection";

  const handleClose = () => {
    void setParams({ action: null });
  };

  const [connections] = use(promise);

  const UpdateConnectionsContent = () => (
    <ConnectionsList
      className={cn({ "px-4": isMobile })}
      connections={connections}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Collega il tuo conto bancario</DrawerTitle>
            <DrawerDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
            </DrawerDescription>
          </DrawerHeader>
          <UpdateConnectionsContent />
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Collega il tuo conto bancario</DialogTitle>
            <DialogDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
            </DialogDescription>
          </DialogHeader>
          <UpdateConnectionsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
