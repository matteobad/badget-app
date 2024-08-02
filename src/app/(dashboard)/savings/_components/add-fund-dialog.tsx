import { PlusCircleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { AddSavingAccountFlow } from "./multi-step-form";
import { findAllPensionFunds } from "./pension-accounts";

export function AddFundDialog() {
  const pensionFundsPromise = findAllPensionFunds();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <PlusCircleIcon className="h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Fund</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 pt-4">
          <AddSavingAccountFlow pensionFundsPromise={pensionFundsPromise} />
        </div>
        {/* <DialogFooter>
          <Button type="submit">Start tracking!</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
