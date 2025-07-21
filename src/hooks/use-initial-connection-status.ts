import { useEffect, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

type UseInitialConnectionStatusProps = {
  runId?: string;
};

export function useInitialConnectionStatus({
  runId: initialRunId,
}: UseInitialConnectionStatusProps) {
  const [runId, setRunId] = useState<string | undefined>(initialRunId);
  const [status, setStatus] = useState<
    "FAILED" | "SYNCING" | "COMPLETED" | null
  >(null);

  const { run, error } = useRealtimeRun(runId, {
    enabled: !!runId,
  });

  useEffect(() => {
    if (initialRunId) {
      setRunId(initialRunId);
      setStatus("SYNCING");
    }
  }, [initialRunId]);

  useEffect(() => {
    if (error || run?.status === "FAILED") {
      setStatus("FAILED");
    }

    if (run?.status === "COMPLETED") {
      setStatus("COMPLETED");
    }
  }, [error, run]);

  return {
    status,
    setStatus,
  };
}
