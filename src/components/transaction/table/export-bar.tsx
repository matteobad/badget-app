import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
import { useExportStore } from "~/lib/stores/export";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadIcon } from "lucide-react";

// import { exportTransactionsAction } from "@/actions/export-transactions-action";

export function ExportBar() {
  const { setExportData } = useExportStore();
  const { rowSelection, setRowSelection } = useTransactionsStore();
  const [isOpen, setOpen] = useState(false);

  const ids = Object.keys(rowSelection);
  const totalSelected = ids.length;

  // const { execute, status } = useAction(exportTransactionsAction, {
  //   onSuccess: ({ data }) => {
  //     if (data?.id && data?.publicAccessToken) {
  //       setExportData({
  //         runId: data.id,
  //         accessToken: data.publicAccessToken,
  //       });

  //       setRowSelection(() => ({}));
  //     }

  //     setOpen(false);
  //   },
  //   onError: () => {
  //     toast.error("Something went wrong please try again.");
  //   },
  // });

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
        className="fixed bottom-4 left-[50%] z-10 -ml-[200px] h-12 w-[400px]"
        animate={{ y: isOpen ? 0 : 100 }}
        initial={{ y: 100 }}
      >
        <div className="mx-2 flex h-12 items-center justify-between border bg-[#F6F6F3]/80 px-4 backdrop-blur-lg backdrop-filter md:mx-0 dark:border-[#2C2C2C] dark:bg-[#1A1A1A]/80">
          <span className="text-sm text-[#878787]">
            <NumberFlow value={Object.keys(rowSelection).length} /> selected
          </span>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => setRowSelection({})}>
              <span>Deselect all</span>
            </Button>
            <SubmitButton
              isSubmitting={status === "executing"}
              // onClick={() =>
              //   execute({
              //     transactionIds: ids,
              //     dateFormat: user?.dateFormat ?? undefined,
              //     locale: user?.locale ?? undefined,
              //   })
              // }
            >
              <div className="flex items-center space-x-2">
                <span>Export</span>
                <DownloadIcon className="size-4" />
              </div>
            </SubmitButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
