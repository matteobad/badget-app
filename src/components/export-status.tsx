"use client";

import { useEffect, useState } from "react";
import { useExportStatus } from "~/hooks/use-export-status";
import { useExportStore } from "~/lib/stores/export";
import { toast } from "sonner";

import { Button } from "./ui/button";

type ExportData = {
  runId?: string;
  accessToken?: string;
  result: {
    filePath: string;
    fullPath: string | undefined;
    fileName: string | undefined;
    totalItems: number;
  };
};

export function ExportStatus() {
  const [loadingToastId, setLoadingToastId] = useState<string | number>();
  const { exportData, setExportData } = useExportStore();
  const { status, progress, result } = useExportStatus(
    exportData as ExportData,
  );

  useEffect(() => {
    if (status === "FAILED") {
      toast.error("Something went wrong please try again.");
      setLoadingToastId(undefined);
      setExportData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (exportData && !loadingToastId) {
      const id = toast.loading("Exporting transactions.", {
        description: "Please do not close browser until completed",
      });
      setLoadingToastId(id);
    }

    if (status === "COMPLETED" && result) {
      // close loading toast
      toast.dismiss(loadingToastId);
      setLoadingToastId(undefined);

      toast.custom((t) => (
        <div className="p-4">
          <div className="mb-1 font-semibold">Export completed</div>
          <div className="mb-2 text-sm">
            {`Your export is ready based on ${result.totalItems} transactions. It's stored in your Vault.`}
          </div>
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              onClick={async () => {
                if (result?.downloadUrl && result?.fileName) {
                  const url = new URL(result.downloadUrl);
                  const response = await fetch(url);
                  const blob = await response.blob();

                  // Create a temporary link to trigger the download
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = result.fileName;
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => {
                    URL.revokeObjectURL(link.href);
                    document.body.removeChild(link);
                  }, 100);
                }
                toast.dismiss(t);
              }}
            >
              Download
            </Button>
          </div>
        </div>
      ));

      // clean up
      setExportData(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingToastId, progress, status]);

  return null;
}
