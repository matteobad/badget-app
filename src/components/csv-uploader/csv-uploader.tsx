"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useDropzone } from "@uploadthing/react";
import { ArrowRight, Info, Upload } from "lucide-react";

import type { CSVMapping } from "~/utils/schemas";
import { Card, CardContent } from "~/components/ui/card";
import { type ProcessingStatus } from "~/lib/types";
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type csvValidator } from "~/trigger/csv";
import { CSVUploadMetadataSchema } from "~/utils/schemas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const predefinedFields: (keyof CSVMapping)[] = [
  "date",
  "description",
  "amount",
]; // Example predefined fields

const DEFAULT_CSV_MAPPING: CSVMapping = {
  date: "date",
  description: "description",
  amount: "amount",
};

type CSVUploadOptions = {
  headers: string[];
  setHeaders: (headers: string[]) => void;
  mapping: CSVMapping;
  setMapping: (mapping: CSVMapping) => void;
  accountId: string;
  setAccountId: (id: string) => void;
  inverted: boolean;
  setInverted: (inverted: boolean) => void;
  accounts: DB_AccountType[];
};

type BackfillTransactionContext = {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  options: CSVUploadOptions;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  status: ProcessingStatus;
  setStatus: (status: ProcessingStatus) => void;
  runHandle: { id: string; publicAccessToken: string } | null;
  setRunHandle: (handle: { id: string; publicAccessToken: string }) => void;
};

const BackfillTransactionContext =
  createContext<BackfillTransactionContext | null>(null);

function useCSVUploader() {
  const context = useContext(BackfillTransactionContext);
  if (!context) {
    throw new Error("useCSVUploader must be used within CSVUploaderProvider");
  }

  return context;
}

function useRealtimeCSVValidator(runId?: string, accessToken?: string) {
  const instance = useRealtimeRun<typeof csvValidator>(runId, {
    accessToken,
    baseURL: process.env.NEXT_PUBLIC_TRIGGER_API_URL,
    enabled: !!runId && !!accessToken,
  });

  if (!instance.run) {
    return { status: "loading", progress: 0, message: "Loading..." };
  }

  const startedAt = instance.run.startedAt;
  const finishedAt = instance.run.finishedAt;

  const durationInSeconds =
    startedAt && finishedAt
      ? (finishedAt.getTime() - startedAt.getTime()) / 1000
      : undefined;

  console.log("CSV Upload", instance.run);

  if (!instance.run.metadata) {
    return {
      status: "queued",
      progress: 0.05,
      message: "Queued...",
      filename: instance.run.payload.file.name,
    };
  }

  const parsedMetadata = CSVUploadMetadataSchema.safeParse(
    instance.run.metadata,
  );

  if (!parsedMetadata.success) {
    return {
      status: "error",
      progress: 0,
      message: "Failed to parse metadata",
      filename: instance.run.payload.file.name,
    };
  }

  switch (parsedMetadata.data.status) {
    case "fetching": {
      return {
        status: "fetching",
        progress: 0.1,
        message: "Fetching CSV file...",
        filename: instance.run.payload.file.name,
      };
    }
    case "parsing": {
      return {
        status: "parsing",
        progress: 0.2,
        message: "Parsing CSV file...",
        filename: instance.run.payload.file.name,
      };
    }
    case "processing": {
      // progress will be some number between 0.3 and 0.95
      // depending on the totalRows and processedRows

      const progress =
        typeof parsedMetadata.data.totalProcessed === "number" &&
        typeof parsedMetadata.data.totalRows === "number"
          ? 0.3 +
            (parsedMetadata.data.totalProcessed /
              parsedMetadata.data.totalRows) *
              0.65
          : 0.3;

      return {
        status: "processing",
        progress: progress,
        message: "Processing CSV file...",
        totalRows: parsedMetadata.data.totalRows,
        totalProcessed: parsedMetadata.data.totalProcessed,
        filename: instance.run.payload.file.name,
        batches: parsedMetadata.data.batches,
        totalValid: parsedMetadata.data.totalValid,
        totalInvalid: parsedMetadata.data.totalInvalid,
        totalApiCalls: parsedMetadata.data.totalApiCalls,
        durationInSeconds,
      };
    }
    case "complete": {
      return {
        status: "complete",
        progress: 1,
        message: "CSV processing complete",
        totalRows: parsedMetadata.data.totalRows,
        totalProcessed: parsedMetadata.data.totalProcessed,
        filename: instance.run.payload.file.name,
        batches: parsedMetadata.data.batches,
        totalValid: parsedMetadata.data.totalValid,
        totalInvalid: parsedMetadata.data.totalInvalid,
        totalApiCalls: parsedMetadata.data.totalApiCalls,
        durationInSeconds,
      };
    }
  }
}

const BackfillTransactionProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    accounts: DB_AccountType[];
    defaultMapping?: CSVMapping;
  }
>(
  (
    {
      defaultMapping = DEFAULT_CSV_MAPPING,
      accounts,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // This is the internal state of the backfiller.
    // We use openProp and setOpenProp for control from outside the component.
    const [file, setFile] = useState<File>();

    // This is the state for the CSV parsing options.
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<CSVMapping>(defaultMapping);
    const [accountId, setAccountId] = useState<string>("");
    const [inverted, setInverted] = useState(false);

    // This is the state for the upload handler.
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [runHandle, setRunHandle] = useState<{
      id: string;
      publicAccessToken: string;
    } | null>(null);

    const contextValue = React.useMemo<BackfillTransactionContext>(
      () => ({
        file,
        setFile,
        options: {
          headers,
          setHeaders,
          mapping,
          setMapping,
          accountId,
          setAccountId,
          inverted,
          setInverted,
          accounts,
        },
        uploadProgress,
        setUploadProgress,
        status,
        setStatus,
        runHandle,
        setRunHandle,
      }),
      [
        file,
        headers,
        mapping,
        accountId,
        inverted,
        uploadProgress,
        status,
        runHandle,
        accounts,
      ],
    );

    return (
      <BackfillTransactionContext.Provider value={contextValue}>
        <div
          className={cn("group/csv-uploader-wrapper flex w-full", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </BackfillTransactionContext.Provider>
    );
  },
);
BackfillTransactionProvider.displayName = "BackfillTransactionProvider";

const CSVUploaderDropzone = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    onFileUpload: (file: File) => void;
  }
>(({ onFileUpload, className, ...props }, ref) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]!);
      }
    },
    [onFileUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${
          isDragActive ? "border-primary" : "border-muted-foreground"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop a CSV file here, or click to select one
        </p>
      </div>
    </div>
  );
});
CSVUploaderDropzone.displayName = "CSVUploaderDropzone";

const CSVUploaderMapping = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { options } = useCSVUploader();
  const { accounts, setAccountId } = options;

  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    >
      <p className="text-muted-foreground">
        {
          "We've mapped each column to what we believe is correct, but please review the data below to confirm it's accurate."
        }
      </p>

      <div className="space-y-4">
        {predefinedFields.map((field) => {
          return (
            <div
              className="grid grid-cols-[1fr,auto,1fr] items-center gap-4"
              key={field}
            >
              <Select
                value={options.mapping[field] ?? ""}
                onValueChange={(value) =>
                  options.setMapping({
                    ...options.mapping,
                    [field]: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CSV column" />
                </SelectTrigger>
                <SelectContent>
                  {options.headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ArrowRight className="size-4 text-muted-foreground" />

              <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
                <span className="text-sm text-muted-foreground">{field}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Transaction {field} information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="account"
        className="mb-6 w-full"
      >
        <Separator />
        {/* Account Section */}
        <AccordionItem value="account">
          <AccordionTrigger>Account</AccordionTrigger>
          <AccordionContent>
            <h4 className="mb-2 font-medium">Bank account</h4>
            <Select onValueChange={(value) => setAccountId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => {
                  return (
                    <SelectItem value={account.id.toString()} key={account.id}>
                      {account.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Settings Section */}
        <AccordionItem value="settings">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <h4 className="mb-2 font-medium">Inverted amount</h4>
            <div className="flex gap-2">
              <p className="mb-4 text-muted-foreground">
                If the transactions are from credit account, you can invert the
                amount.
              </p>
              <Switch />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});
CSVUploaderMapping.displayName = "CSVUploaderMapping";

const CSVUploaderProgress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { status, uploadProgress, runHandle } = useCSVUploader();

  // TODO: move this into the provider context
  const csvValidation = useRealtimeCSVValidator(
    runHandle?.id,
    runHandle?.publicAccessToken,
  );

  const {
    totalProcessed: emailsProcessed = 0,
    totalRows: totalEmails = 0,
    // totalValid = 0,
    // totalInvalid = 0,
    // totalApiCalls = 0,
    batches = [],
  } = csvValidation;

  const emailsRemaining = totalEmails - emailsProcessed;
  const progress = Math.round(
    Math.min(100, (emailsProcessed / totalEmails) * 100),
  );

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {status === "uploading" ? "Upload Progress" : "Processing Progress"}
          </span>
          <span className="font-mono">
            {status === "uploading" ? uploadProgress.toFixed(0) : progress}%
          </span>
        </div>
        <Progress
          value={status === "uploading" ? uploadProgress : progress}
          className="h-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{emailsProcessed}</div>
            <div className="text-sm text-muted-foreground">
              Emails Processed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{emailsRemaining}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Batch Status</h3>
        <div className="space-y-2">
          {(batches ?? []).map((batch, batchId) => {
            return (
              <div
                key={batchId}
                className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      batch.status === "complete"
                        ? "default"
                        : batch.status === "processing"
                          ? "secondary"
                          : "outline"
                    }
                    className="w-24 justify-center"
                  >
                    {batch.status}
                  </Badge>
                  <span>Batch {batchId + 1}</span>
                </div>
                <div className="font-mono text-muted-foreground">
                  {batch.processed}/{batch.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Estimated Time</div>
            <div className="font-mono">
              ~{Math.ceil((100 - progress) / 10)} min remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
CSVUploaderProgress.displayName = "CSVUploaderProgress";

export { BackfillTransactionProvider as CSVImporterProvider };

// function getStatusDescription(status: ProcessingStatus, totalEmails: number) {
//   switch (status) {
//     case "idle":
//       return "Upload a CSV file of your transactions.";
//     case "uploading":
//       return "Uploading CSV file...";
//     case "processing":
//       return `Processing ${totalEmails} transactions`;
//     case "complete":
//       return `Processed ${totalEmails} transactions`;
//     default:
//       return "";
//   }
// }
