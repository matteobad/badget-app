import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { GoCardLessConnect } from "./gocardless-connect";

type Props = {
  id: string;
  name: string;
  provider: string;
  availableHistory: number;
  popularity: number;
  type?: "personal" | "business";
};

export function ConnectBankProvider({
  id,
  provider,
  availableHistory,
  popularity,
}: Props) {
  const trpc = useTRPC();
  const updateUsageMutation = useMutation(
    trpc.institution.updateUsage.mutationOptions(),
  );

  const updateUsage = () => {
    updateUsageMutation.mutate({ id, popularity: Math.max(100, popularity) });
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
