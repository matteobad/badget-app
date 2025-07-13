import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { DeleteIcon, Loader2Icon } from "lucide-react";

export function DeleteCategoryDialog({ categoryId }: { categoryId: string }) {
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    trpc.category.delete.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getWithBudgets.queryKey(),
        });
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-4 text-neutral-300">
          <DeleteIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Elimina categoria</DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 text-muted-foreground">
          <p>Vuoi davvero eliminare questa categoria?</p>
          <p>
            Se non ti serve più, ma non vuoi impattare le transazioni ad essa
            associate possiamo archiviarla.
          </p>
          <p>
            Altrimenti puoi eliminarla definitivamente così facendo le
            transazioni verranno marcate come &quot;non categorizzato&quot;
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Archivia</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              void deleteMutation.mutate({
                id: categoryId,
              });
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Elimino categoria...
              </>
            ) : (
              "Elimina"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
