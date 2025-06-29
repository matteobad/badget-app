import { AlertCircleIcon, CheckIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  fullfilled: boolean;
};

export function TransactionStatus({ fullfilled }: Props) {
  if (fullfilled) {
    return (
      <div className="flex justify-end">
        <CheckIcon />
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <TooltipProvider delayDuration={50}>
        <Tooltip>
          <TooltipTrigger>
            <AlertCircleIcon />
          </TooltipTrigger>
          <TooltipContent
            className="px-3 py-1.5 text-xs"
            side="left"
            sideOffset={10}
          >
            Missing receipt
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
