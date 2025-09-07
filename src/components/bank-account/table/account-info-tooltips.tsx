import { EyeOffIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

type AccountInfoTooltipsProps = {
  excludeFromReports?: boolean;
};

export function AccountInfoTooltips({
  excludeFromReports,
}: AccountInfoTooltipsProps) {
  return (
    <div className="flex items-center gap-4">
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
              Questo account è disabilitato e quindi, escluso dai report
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
