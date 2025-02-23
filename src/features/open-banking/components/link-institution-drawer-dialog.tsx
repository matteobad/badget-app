"use client";

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
import { type DB_InstitutionType } from "~/server/db/schema/open-banking";
import { actionsParsers } from "~/utils/search-params";
import LinkInstitutionForm from "./link-institution-form";

export default function LinkInstitutionDrawerDialog({
  institutions,
}: {
  institutions: DB_InstitutionType[];
}) {
  const [{ action }, setParams] = useQueryStates(actionsParsers);
  const open = action === "link-institution";

  const isMobile = useIsMobile();

  const PanelContent = () => (
    <LinkInstitutionForm
      className={cn({ "px-4": isMobile })}
      institutions={institutions}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={() => setParams({ action: null })}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Collega il tuo conto bancario</DrawerTitle>
            <DrawerDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
            </DrawerDescription>
          </DrawerHeader>
          <PanelContent />
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
    <Dialog open={open} onOpenChange={() => setParams({ action: null })}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Collega il tuo conto bancario</DialogTitle>
            <DialogDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
            </DialogDescription>
          </DialogHeader>
          <PanelContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
