import { RefreshCwIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
  disabled: boolean;
  onClick: () => void;
};

export function SyncTransactions({ onClick, disabled }: Props) {
  return (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="flex h-7 w-7 items-center rounded-full"
            disabled={disabled}
            onClick={onClick}
          >
            <RefreshCwIcon size={16} />
          </Button>
        </TooltipTrigger>

        <TooltipContent className="px-3 py-1.5 text-xs" sideOffset={10}>
          Synchronize
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
