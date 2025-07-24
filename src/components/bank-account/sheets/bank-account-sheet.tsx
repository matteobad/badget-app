import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";

import { BankAccountDetails } from "../bank-account-details";

export function BankAccountSheet() {
  const { params, setParams } = useBankAccountParams();

  const isOpen = !!params.bankAccountId;

  const onOpenChange = () => {
    void setParams({ bankAccountId: null });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-4 [&>button]:hidden">
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Modifica spesa o entrate</SheetTitle>
            <SheetDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>

          <BankAccountDetails />
        </div>
      </SheetContent>
    </Sheet>
  );
}
