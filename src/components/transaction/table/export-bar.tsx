import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useUserQuery } from "~/hooks/use-user";
import { useExportStore } from "~/lib/stores/export";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { exportTransactionsAction } from "~/server/domain/transaction/actions";
import { useScopedI18n } from "~/shared/locales/client";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { BulkActions } from "../transaction-bulk-actions";

export function ExportBar() {
  const { data: user } = useUserQuery();

  const { setExportData } = useExportStore();
  const { rowSelection, setRowSelection } = useTransactionsStore();
  const [isOpen, setOpen] = useState(false);

  const ids = Object.keys(rowSelection);
  const totalSelected = ids.length;

  const tScoped = useScopedI18n("transaction.action_bar");

  const { execute, status } = useAction(exportTransactionsAction, {
    onSuccess: ({ data }) => {
      if (data?.id && data?.publicAccessToken) {
        setExportData({
          runId: data.id,
          accessToken: data.publicAccessToken,
        });

        setRowSelection(() => ({}));
      }

      setOpen(false);
    },
    onError: () => {
      toast.error("Something went wrong please try again.");
    },
  });

  useEffect(() => {
    if (totalSelected) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [totalSelected]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-[50%] z-10 -ml-[200px] h-12 w-[470px] shadow"
        animate={{ y: isOpen ? 0 : 100 }}
        initial={{ y: 100 }}
      >
        <div className="mx-2 flex h-12 items-center justify-between border bg-[#F6F6F3]/80 px-4 backdrop-blur-lg backdrop-filter md:mx-0 dark:border-[#2C2C2C] dark:bg-[#1A1A1A]/80">
          <span className="text-sm text-[#878787]">
            <NumberFlow value={Object.keys(rowSelection).length} />{" "}
            {tScoped("selected", { count: Object.keys(rowSelection).length })}
          </span>

          <div className="flex items-center space-x-2 divide-x">
            <div className="pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="size-9"
                    onClick={() => setRowSelection({})}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tScoped("deselect_tooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <BulkActions ids={ids} />
            <SubmitButton
              size="sm"
              className="ml-2"
              isSubmitting={status === "executing"}
              onClick={() =>
                execute({
                  transactionIds: ids,
                  dateFormat: user?.dateFormat ?? undefined,
                  locale: user?.locale ?? undefined,
                })
              }
            >
              <div className="flex items-center space-x-2">
                <span>{tScoped("export_label")}</span>
                <DownloadIcon className="size-4" />
              </div>
            </SubmitButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
