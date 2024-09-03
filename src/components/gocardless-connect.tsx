import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createGoCardLessLinkAction } from "../server/actions/institutions/create-gocardless-link";
import { Button } from "./ui/button";

type Props = {
  id: string;
  availableHistory: number;
  onSelect: () => void;
};

export function GoCardLessConnect({ onSelect, id, availableHistory }: Props) {
  const { execute, isExecuting } = useAction(createGoCardLessLinkAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
  });

  const handleOnSelect = () => {
    onSelect();

    execute({
      institutionId: id,
      availableHistory: availableHistory,
      redirectBase: window.location.origin + window.location.pathname,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isExecuting}
      onClick={handleOnSelect}
    >
      {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
    </Button>
  );
}
