import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createGoCardLessLinkAction } from "../server/actions/institutions/create-gocardless-link";
import { BankConnectButton } from "./bank-connect-button";

type Props = {
  id: string;
  availableHistory: number;
  onSelect: () => void;
};

export function GoCardLessConnect({ onSelect, id, availableHistory }: Props) {
  const createGoCardLessLink = useAction(createGoCardLessLinkAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
  });

  const handleOnSelect = () => {
    onSelect();

    createGoCardLessLink.execute({
      institutionId: id,
      availableHistory: availableHistory,
      redirectBase: window.location.origin + window.location.pathname,
    });
  };

  return <BankConnectButton onClick={handleOnSelect} />;
}
