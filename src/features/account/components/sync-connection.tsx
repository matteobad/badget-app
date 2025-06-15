"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { syncConnectionAction } from "../server/actions";

export default function SyncConnection({ id }: { id: string }) {
  const { execute, isExecuting } = useAction(syncConnectionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      toast.success(data?.message);
    },
  });

  useEffect(() => {
    execute({ ref: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isExecuting ? (
    <SyncDataLoading />
  ) : (
    <Button asChild>
      <Link href="/transactions">Vai alla dashboard</Link>
    </Button>
  );
}

export function SyncDataLoading() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2Icon className="size-4 animate-spin" />
      Sto sincronizzando i dati
    </div>
  );
}
