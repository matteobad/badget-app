"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function AddBankAccountModal({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleOnClose = () => {
    router.replace(`${pathname}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent className="flex h-full w-full max-w-screen-sm sm:max-h-[600px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Aggiungi Conto</DialogTitle>
          <DialogDescription>
            Se non trovi il tuo conto nella lista delle connessioni supportate,
            qui puoi tracciare comunque il tuo conto manualmente.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
