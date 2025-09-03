import type { TransactionFrequencyType } from "~/shared/constants/enum";
import { CalendarSyncIcon, EyeOffIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type TransactionInfoTooltipsProps = {
  recurring: boolean;
  frequency?: TransactionFrequencyType;
  excludeFromReports: boolean;
};

export function TransactionInfoTooltips({
  recurring,
  frequency,
  excludeFromReports,
}: TransactionInfoTooltipsProps) {
  return (
    <div className="flex items-center gap-2">
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
      {excludeFromReports && (
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
    </div>
  );
}
