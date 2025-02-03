"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "@uploadthing/react";
import { toast } from "sonner";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useProcessingStatus } from "~/hooks/use-processing-status";
import { useRealtimeCSVValidator } from "~/hooks/use-realtime-csv-validator";
import { type ProcessingStatus } from "~/lib/types";
import { useUploadThing } from "~/utils/uploadthing";
import { CompletedSection } from "./completed-section";
import DataMapping from "./data-mapping";
import { Dropzone } from "./dropzone";
import { ProgressSection } from "./progress-section";
import { StatusBadge } from "./status-badge";

export default function CSVUploader() {
  const [file, setFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [runHandle, setRunHandle] = useState<{
    id: string;
    publicAccessToken: string;
  } | null>(null);

  // useCSVUpload wraps useRealtimeRun from @trigger.dev/react-hooks
  // See the implementation in hooks/useCSVUpload.ts
  const csvValidation = useRealtimeCSVValidator(
    runHandle?.id,
    runHandle?.publicAccessToken,
  );

  const {
    totalProcessed: emailsProcessed = 0,
    totalRows: totalEmails = 0,
    totalValid = 0,
    totalInvalid = 0,
    totalApiCalls = 0,
    batches = [],
  } = csvValidation;

  const emailsRemaining = totalEmails - emailsProcessed;
  const progress = Math.round(
    Math.min(100, (emailsProcessed / totalEmails) * 100),
  );

  // We will compute the status as "completed" if the progress is 100%
  const currentStatus = useProcessingStatus({ status, progress });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { startUpload, routeConfig } = useUploadThing("csvUploader", {
    onClientUploadComplete: (res) => {
      setStatus("processing");
      toast.success("Upload complete", {
        description: `File ${file?.name} has been uploaded successfully. Processing started.`,
      });

      // serverData is the "handle" returned from tasks.trigger
      // See this call in the uploadthing router in src/app/api/uploadthing/core.ts
      setRunHandle(res[0]?.serverData ?? null);
    },
    onUploadError: (error) => {
      setStatus("idle");
      toast.error("Upload failed", {
        description: error.message,
      });
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    await startUpload([file]);
  };

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>{file ? file.name : "Select a file"}</CardTitle>
              <CardDescription>
                {getStatusDescription(currentStatus, totalEmails)}
              </CardDescription>
            </div>
            <StatusBadge status={currentStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStatus === "idle" && !file && (
            <Dropzone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              file={file}
              // onUpload={handleUpload}
            />
          )}

          {currentStatus === "idle" && file && (
            <DataMapping
              file={file}
              setFile={setFile}
              onUpload={handleUpload}
            />
          )}

          {(currentStatus === "uploading" ||
            currentStatus === "processing") && (
            <ProgressSection
              status={currentStatus}
              progress={progress}
              uploadProgress={uploadProgress}
              emailsProcessed={emailsProcessed}
              emailsRemaining={emailsRemaining}
              batches={batches}
            />
          )}

          {currentStatus === "complete" && (
            <CompletedSection
              totalValid={totalValid}
              totalInvalid={totalInvalid}
              totalEmails={totalEmails}
              totalApiCalls={totalApiCalls}
              durationInSeconds={csvValidation.durationInSeconds}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getStatusDescription(status: ProcessingStatus, totalEmails: number) {
  switch (status) {
    case "idle":
      return "Upload a CSV file of your transactions.";
    case "uploading":
      return "Uploading CSV file...";
    case "processing":
      return `Processing ${totalEmails} transactions`;
    case "complete":
      return `Processed ${totalEmails} transactions`;
    default:
      return "";
  }
}
