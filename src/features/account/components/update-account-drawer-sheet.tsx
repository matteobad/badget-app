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
import { formatAmount } from "~/utils/format";
import { type getAccountsForUser_CACHED } from "../server/cached-queries";
import { accountsParsers } from "../utils/search-params";
import UpdateAccountForm from "./update-account-form";

type GroupedAccount = Awaited<
  ReturnType<typeof getAccountsForUser_CACHED>
>[number];

export default function UpdateAccountDrawerSheet({
  data,
}: {
  data: GroupedAccount[];
}) {
  const [{ id }, setParams] = useQueryStates(accountsParsers);
  const isMobile = useIsMobile();

  const open = !!id;

  const handleClose = () => {
    void setParams({ id: null });
  };

  const { account, connection, institution } = useMemo(() => {
    const item = data.find((_) => _.accounts.find((a) => a.id === id));
    return {
      account: item?.accounts.find((a) => a.id === id),
      connection: item?.connection ?? null,
      institution: item?.institution ?? null,
    };
  }, [id, data]);

  if (!account) return;

  const DrawerSheetContent = () => (
    <>
      <div className="mb-8 flex justify-between">
        <AccountAvatar
          account={{
            name: institution?.name ?? "",
            logoUrl: institution?.logo ?? "",
          }}
        />
        <div className="text-sm text-muted-foreground">
          {connection?.provider.toLowerCase()}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <h2>Saldo</h2>
        <span className="font-mono text-4xl">
          {formatAmount({ amount: parseFloat(account.balance) })}
        </span>
      </div>

      <UpdateAccountForm
        className={cn({ "px-4": isMobile })}
        account={account}
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
