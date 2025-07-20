import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { BANK_PROVIDER } from "~/server/db/schema/enum";

export function InstitutionInfo({
  provider,
  children,
}: {
  provider: string;
  children: ReactNode;
}) {
  const getDescription = () => {
    switch (provider) {
      case BANK_PROVIDER.GOCARDLESS:
        return "With GoCardLess we can connect to more than 2,500 banks in 31 countries across the UK and Europe.";
      case BANK_PROVIDER.PLAID:
        return `With Plaid we can connect to 12,000+ financial institutions across the US, Canada, UK, and Europe are covered by Plaid's network`;
      case BANK_PROVIDER.TELLER:
        return "With Teller we can connect instantly to more than 5,000 financial institutions in the US.";
      default:
        break;
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="w-[300px] text-left text-xs" side="right">
          {getDescription()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
