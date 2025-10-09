import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createGocardlessLinkAction } from "~/server/domain/bank-connection/actions";
import { getUrl } from "~/shared/helpers/get-url";

import { BankConnectButton } from "./bank-connect-button";

type Props = {
  id: string;
  availableHistory: number;
  onSelect: () => void;
};

export function GoCardLessConnect({ onSelect, id, availableHistory }: Props) {
  const createGoCardLessLink = useAction(createGocardlessLinkAction, {
    onError: () => {
      toast.error("Something went wrong please try again.");
    },
  });

  const handleOnSelect = () => {
    onSelect();

    createGoCardLessLink.execute({
      institutionId: id,
      availableHistory: availableHistory,
      redirectBase: getUrl(),
    });
  };

  return <BankConnectButton onClick={handleOnSelect} />;
}
