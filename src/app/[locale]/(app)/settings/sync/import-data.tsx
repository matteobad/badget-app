"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { ImportDataSchema } from "~/lib/validators";
import { importDataAction } from "~/server/actions";

export default function ImportData({
  id,
  provider,
  connectionId,
  institutionId,
  institutionLogo,
  className,
}: {
  id: string;
  provider: string;
  connectionId: string;
  institutionId: string;
  institutionLogo: string;
} & React.ComponentProps<"form">) {
  const { execute, isExecuting, reset } = useAction(importDataAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: () => {
      toast.success("Dati importati!");
      reset();
    },
  });

  const form = useForm<z.infer<typeof ImportDataSchema>>({
    resolver: zodResolver(ImportDataSchema),
    defaultValues: {
      id,
      provider,
      connectionId,
      institutionId,
      institutionLogo,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col gap-6", className)}
      >
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Importo Dati...
            </>
          ) : (
            "Importa Dati"
          )}
        </Button>
      </form>
    </Form>
  );
}
