"use client";

import { AccountAvatar } from "~/components/account-avatar";
import { Button } from "~/components/ui/button";
import { type Dialog } from "~/components/ui/dialog";
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
import UpdateAccountForm from "./update-account-form";

type AccountType = Awaited<
  ReturnType<typeof getAccountsForUser_CACHED>
>[number][number];

interface UpdateAccountDrawerSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  account: AccountType;
}

export default function UpdateAccountDrawerSheet({
  account,
  ...props
}: UpdateAccountDrawerSheetProps) {
  const isMobile = useIsMobile();

  const DrawerSheetContent = () => (
    <>
      <div className="mb-8 flex justify-between">
        <AccountAvatar
          account={{
            name: account.institution?.name ?? "",
            logoUrl: account.institution?.logo ?? "",
          }}
        />
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <h2>Saldo</h2>
        <span className="font-mono text-4xl">
          {formatAmount({ amount: account.balance })}
        </span>
      </div>

      <UpdateAccountForm
        className={cn({ "px-4": isMobile })}
        account={account}
        onComplete={() => props.onOpenChange!(false)}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer {...props}>
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
    <Sheet {...props}>
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
