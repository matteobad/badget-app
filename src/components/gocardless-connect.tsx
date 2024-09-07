import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createGoCardLessLinkAction } from "../server/actions/institutions/create-gocardless-link";

type Props = {
  id: string;
  availableHistory: number;
  onSelect: () => void;
  children: React.ReactNode;
};

export function GoCardLessConnect({
  onSelect,
  id,
  availableHistory,
  children,
}: Props) {
  const { execute, isExecuting } = useAction(createGoCardLessLinkAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
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
    <button
      className="h-full w-full"
      disabled={isExecuting}
      onClick={handleOnSelect}
    >
      {children}
    </button>
  );
}
