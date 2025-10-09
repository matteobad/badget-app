import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useConnectParams } from "~/hooks/use-connect-params";
import { useInitialConnectionStatus } from "~/hooks/use-initial-connection-status";
import { cn } from "~/lib/utils";

import { Button } from "../ui/button";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

type Props = {
  accessToken?: string;
  runId?: string;
  setRunId: (runId?: string) => void;
  onClose: () => void;
  setActiveTab: (value: "support" | "loading" | "select-accounts") => void;
};

export function LoadingTransactionsEvent({
  accessToken,
  runId,
  setRunId,
  onClose,
  setActiveTab,
}: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { resolvedTheme } = useTheme();
  const { setParams } = useConnectParams();

  const { status } = useInitialConnectionStatus({
    runId,
    accessToken,
  });

  useEffect(() => {
    if (status === "SYNCING") {
      setStep(2);
    }

    if (status === "COMPLETED") {
      setStep(3);

      // Invalidate queries to refresh the data
      void queryClient.invalidateQueries();

      setTimeout(() => {
        setRunId(undefined);
        void setParams(null);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="w-full">
      <Lottie
        className="mb-6"
        animationData={
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          resolvedTheme === "dark"
            ? // eslint-disable-next-line @typescript-eslint/no-require-imports
              require("public/assets/setup-animation.json")
            : // eslint-disable-next-line @typescript-eslint/no-require-imports
              require("public/assets/setup-animation-dark.json")
        }
        loop={true}
        style={{ width: 50, height: 50 }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
      <h2 className="mb-2 text-lg leading-none font-semibold tracking-tight">
        Setting up account
      </h2>

      <p className="mb-8 text-sm text-[#878787]">
        Depending on the bank it can take up to 1 hour to fetch all
        transactions, feel free to close this window and we will notify you when
        it is done.
      </p>

      <ul className="text-md space-y-4 text-[#878787] transition-all">
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 0 && "!opacity-100",
          )}
        >
          Connecting bank
          {step === 1 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 1 && "!opacity-100",
          )}
        >
          Getting transactions
          {step === 2 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 2 && "!opacity-100",
          )}
        >
          Completed
          {step === 3 && <span className="loading-ellipsis" />}
        </li>
      </ul>

      <div className="mt-12 w-full">
        <Button className="w-full" onClick={onClose}>
          Close
        </Button>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="text-xs text-[#878787]"
            onClick={() => setActiveTab("support")}
          >
            Need support
          </button>
        </div>
      </div>
    </div>
  );
}
