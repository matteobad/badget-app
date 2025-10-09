"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { SubmitButton } from "~/components/submit-button";
import { AnimatedSizeContainer } from "~/components/ui/animated-size-component";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSpaceQuery } from "~/hooks/use-space";
import { useSyncStatus } from "~/hooks/use-sync-status";
import { useUpload } from "~/hooks/use-upload";
import { importTransactionsAction } from "~/server/domain/transaction/actions";
import { uniqueCurrencies } from "~/shared/constants/currencies";
import { useActiveOrganization } from "~/shared/helpers/better-auth/auth-client";
import { stripSpecialCharacters } from "~/shared/helpers/documents";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { ImportCsvContext, importSchema } from "./context";
import { FieldMapping } from "./field-mapping";
import { SelectFile } from "./select-file";

const pages = ["select-file", "confirm-import"] as const;

export function ImportTransactionsModal() {
  const { data: space } = useSpaceQuery();
  const defaultCurrency = space?.baseCurrency ?? "EUR";

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [runId, setRunId] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [isImporting, setIsImporting] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[] | null>(null);
  const [firstRows, setFirstRows] = useState<Record<string, string>[] | null>(
    null,
  );

  const [pageNumber, setPageNumber] = useState<number>(0);
  const page = pages[pageNumber];

  const { data: activeOrganization } = useActiveOrganization();
  const { uploadFile } = useUpload();

  const { status, setStatus } = useSyncStatus({ runId, accessToken });

  const [params, setParams] = useQueryStates({
    step: parseAsString,
    accountId: parseAsString,
    type: parseAsString,
    hide: parseAsBoolean.withDefault(false),
  });

  const isOpen = params.step === "import";

  const importTransactions = useAction(importTransactionsAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setRunId(data.id);
        setAccessToken(data.publicAccessToken);
      }
    },
    onError: () => {
      setIsImporting(false);
      setRunId(undefined);
      setStatus("FAILED");

      toast.error("Something went wrong please try again.");
    },
  });

  const { control, watch, setValue, handleSubmit, reset, formState } = useForm<
    z.infer<typeof importSchema>
  >({
    resolver: zodResolver(importSchema),
    defaultValues: {
      currency: defaultCurrency ?? "EUR",
      bank_account_id: params.accountId ?? undefined,
      inverted: params.type === "credit",
    },
  });

  const file = watch("file");

  const onclose = () => {
    setFileColumns(null);
    setFirstRows(null);
    setPageNumber(0);
    reset();

    void setParams({
      step: null,
      accountId: null,
      type: null,
      hide: null,
    });
  };

  useEffect(() => {
    if (params.accountId) {
      setValue("bank_account_id", params.accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.accountId]);

  useEffect(() => {
    if (params.type) {
      setValue("inverted", params.type === "credit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.type]);

  useEffect(() => {
    if (status === "FAILED") {
      setIsImporting(false);
      setRunId(undefined);

      toast.error("Something went wrong please try again or contact support.");
    }
  }, [status]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setRunId(undefined);
      setIsImporting(false);
      onclose();

      void queryClient.invalidateQueries({
        queryKey: trpc.transaction.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.bankAccount.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.bankConnection.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.metrics.pathKey(),
      });

      toast.success("Transactions imported successfully.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Go to second page if file looks good
  useEffect(() => {
    if (file && fileColumns && pageNumber === 0) {
      setPageNumber(1);
    }
  }, [file, fileColumns, pageNumber]);

  return (
    <Dialog open={isOpen} onOpenChange={onclose}>
      <DialogContent>
        <div className="pb-0">
          <DialogHeader className="p-[3px]">
            <div className="mb-4 flex items-center space-x-4">
              {!params.hide && (
                <button
                  type="button"
                  className="items-center border bg-accent p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  onClick={() => setParams({ step: "connect" })}
                >
                  <ArrowLeftIcon className="size-3.5" />
                </button>
              )}
              <DialogTitle className="m-0 p-0">
                {page === "select-file" && "Select file"}
                {page === "confirm-import" && "Confirm import"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {page === "select-file" &&
                "Upload a CSV file of your transactions."}
              {page === "confirm-import" &&
                "We’ve mapped each column to what we believe is correct, but please review the data below to confirm it’s accurate."}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <AnimatedSizeContainer height>
              <ImportCsvContext.Provider
                value={{
                  fileColumns,
                  setFileColumns,
                  firstRows,
                  setFirstRows,
                  control,
                  watch,
                  setValue,
                }}
              >
                <div>
                  <form
                    className="flex flex-col gap-y-2 p-[3px]"
                    onSubmit={handleSubmit(async (data) => {
                      setIsImporting(true);

                      const filename = stripSpecialCharacters(data.file.name);
                      const { pathname } = await uploadFile({
                        path: [
                          activeOrganization?.id ?? "",
                          "imports",
                          filename,
                        ],
                        file,
                      });

                      importTransactions.execute({
                        filePath: pathname.split("/"),
                        currency: data.currency,
                        bankAccountId: data.bank_account_id,
                        inverted: data.inverted,
                        mappings: {
                          amount: data.amount,
                          date: data.date,
                          description: data.description,
                        },
                      });
                    })}
                  >
                    {page === "select-file" && <SelectFile />}
                    {page === "confirm-import" && (
                      <>
                        <FieldMapping currencies={uniqueCurrencies} />

                        <SubmitButton
                          isSubmitting={isImporting}
                          disabled={!formState.isValid}
                          className="mt-4"
                        >
                          Confirm import
                        </SubmitButton>

                        <Button
                          type="button"
                          variant="ghost"
                          className="text-sm font-normal"
                          onClick={() => {
                            setPageNumber(0);
                            reset();
                            setFileColumns(null);
                            setFirstRows(null);
                          }}
                        >
                          Choose another file
                        </Button>
                      </>
                    )}
                  </form>
                </div>
              </ImportCsvContext.Provider>
            </AnimatedSizeContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
