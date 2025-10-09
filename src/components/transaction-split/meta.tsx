import { useFormContext } from "react-hook-form";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import type { SplitFormValues } from "./form-context";

export function Meta() {
  const { watch } = useFormContext<SplitFormValues>();
  const transactionDate = watch("transaction.date");
  const transactionName = watch("transaction.name");
  const transactionAmount = watch("transaction.amount");

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="mb-2 w-fit min-w-[100px] !border-none text-[21px] font-medium">
          Dividi transazione
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-0.5">
        <div className="">
          <span className="mr-1 flex-shrink-0 font-mono text-xs text-muted-foreground">
            Description:
          </span>
          <span className="h-4.5 w-28 flex-shrink overflow-hidden border-none p-0 text-xs">
            {transactionName}
          </span>
        </div>
        <div className="">
          <span className="mr-1 flex-shrink-0 font-mono text-xs text-muted-foreground">
            Value date:
          </span>
          <span className="h-4.5 w-28 flex-shrink overflow-hidden border-none p-0 text-xs">
            {transactionDate}
          </span>
        </div>
        <div className="">
          <span className="mr-1 flex-shrink-0 font-mono text-xs text-muted-foreground">
            Total amount:
          </span>
          <span className="h-4.5 w-28 flex-shrink overflow-hidden border-none p-0 text-xs">
            {transactionAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
