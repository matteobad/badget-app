import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { GoCardLessConnect } from "./gocardless-connect";

type Props = {
  id: string;
  name: string;
  provider: string;
  availableHistory: number;
  type?: "personal" | "business";
};

export function ConnectBankProvider({ id, provider, availableHistory }: Props) {
  const trpc = useTRPC();
  const updateUsageMutation = useMutation(
    trpc.institution.updateUsage.mutationOptions(),
  );

  const updateUsage = () => {
    updateUsageMutation.mutate({ id });
  };

  switch (provider) {
    case "gocardless": {
      return (
        <GoCardLessConnect
          id={id}
          availableHistory={availableHistory}
          onSelect={() => {
            updateUsage();
          }}
        />
      );
    }

    default:
      return null;
  }
}
