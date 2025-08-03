"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useTagParams } from "~/hooks/use-tag-params";

import CreateTagForm from "../forms/create-tag-form";

export default function CreateTagDialog() {
  const { params, setParams } = useTagParams();

  const isOpen = !!params.createTag;

  const onOpenChange = () => {
    void setParams(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Nuovo tag</DialogTitle>
            <DialogDescription>
              Inserisci il nome e le informazioni del nuovo tag che desideri
              creare.
            </DialogDescription>
          </DialogHeader>

          <CreateTagForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
