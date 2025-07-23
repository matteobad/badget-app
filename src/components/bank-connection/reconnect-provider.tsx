import { useState } from "react";
import { reconnectGocardlessLinkAction } from "~/server/domain/bank-connection/actions";
import { getUrl } from "~/shared/helpers/get-url";
import { LinkIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Spinner } from "../load-more";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  id: string;
  provider: string;
  institutionId: string;
  variant?: "button" | "icon";
};

export function ReconnectProvider({
  id,
  provider,
  institutionId,
  variant,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const reconnectGoCardLessLink = useAction(reconnectGocardlessLinkAction, {
    onExecute: () => {
      setIsLoading(true);
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Something went wrong please try again.");
    },
    onSuccess: () => {
      setIsLoading(false);
    },
  });

  const handleOnClick = async () => {
    switch (provider) {
      case "gocardless": {
        return reconnectGoCardLessLink.execute({
          id,
          institutionId,
          redirectTo: `${getUrl()}/api/gocardless/reconnect`,
        });
      }
      default:
        return;
    }
  };

  if (variant === "button") {
    return (
      <Button variant="outline" onClick={handleOnClick} disabled={isLoading}>
        {isLoading ? <Spinner className="size-3.5" /> : "Reconnect"}
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="flex h-7 w-7 items-center rounded-full"
            onClick={handleOnClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="size-3.5" />
            ) : (
              <LinkIcon size={16} />
            )}
          </Button>
        </TooltipTrigger>

        <TooltipContent className="px-3 py-1.5 text-xs" sideOffset={10}>
          Reconnect
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
