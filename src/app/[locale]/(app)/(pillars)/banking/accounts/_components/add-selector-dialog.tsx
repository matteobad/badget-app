"use client";

import { FileText, Link } from "lucide-react";
import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { accountsParsers } from "../account-search-params";

export function AddSelectorDialog({ open }: { open: boolean }) {
  const [, setState] = useQueryStates(accountsParsers);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        void setState({ action: null }, { shallow: false });
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aggiungi dei dati</DialogTitle>
          <DialogDescription>
            Scegli come preferisci collegare i tuoi dati.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Button variant={"outline"} className="w-full">
              <Link />
              Collega un conto
            </Button>
            <span className="text-xs text-muted-foreground">
              Collega un conto corrente. Al resto ci penseremo noi
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant={"outline"} className="w-full">
              <FileText />
              Importa da file
            </Button>
            <span className="text-xs text-muted-foreground">
              Carica il tuo estratto conto o una lista di transazioni
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
