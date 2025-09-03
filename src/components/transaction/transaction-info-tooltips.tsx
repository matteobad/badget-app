import type { TransactionFrequencyType } from "~/shared/constants/enum";
import { CalendarSyncIcon, EyeOffIcon, SplitIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type TransactionInfoTooltipsProps = {
  recurring?: boolean;
  frequency?: TransactionFrequencyType;
  excludeFromReports?: boolean;
  split?: boolean;
};

export function TransactionInfoTooltips({
  recurring,
  frequency,
  excludeFromReports,
  split,
}: TransactionInfoTooltipsProps) {
  return (
    <div className="flex items-center gap-4">
      {recurring && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CalendarSyncIcon className="size-3.5 shrink-0 cursor-auto text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent
              className="w-[220px] text-left text-xs"
              side="right"
            >
              Questa transazione è ricorrente, con periodicità {frequency}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {excludeFromReports && !split && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <EyeOffIcon className="size-3.5 shrink-0 cursor-auto text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent
              className="w-[220px] text-left text-xs"
              side="right"
            >
              Questa transazione è esclusa dai report
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {split && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SplitIcon className="size-3.5 shrink-0 cursor-auto text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent
              className="w-[220px] text-left text-xs"
              side="right"
            >
              Questa transazione è stata splittata in più parti
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
