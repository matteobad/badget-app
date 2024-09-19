import { useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, Landmark, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { type getPendingBankConnections } from "~/lib/data";
import { euroFormat } from "~/lib/utils";
import { upsertBankConnectionBulkSchema } from "~/lib/validators";
import { upsertBankConnectionBulkAction } from "~/server/actions/connect-bank-account-action";
import { Provider } from "~/server/db/schema/enum";
import { useSearchParams } from "../_hooks/use-search-params";

export function SelectAccountForm({
  formRef,
  connections,
  setIsExecuting,
}: {
  formRef: React.RefObject<HTMLFormElement>;
  connections: Awaited<ReturnType<typeof getPendingBankConnections>>;
  setIsExecuting: (isExecuting: boolean) => void;
}) {
  const [, setParams] = useSearchParams();

  const form = useForm<z.infer<typeof upsertBankConnectionBulkSchema>>({
    resolver: zodResolver(upsertBankConnectionBulkSchema),
    defaultValues: {
      connections: connections.map(({ connection, accounts }) => ({
        connection,
        accounts: accounts.map((account) => ({
          ...account,
          enabled: true,
        })),
      })),
    },
  });

  const { execute, isExecuting } = useAction(upsertBankConnectionBulkAction, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? error.validationErrors?._errors);
    },
    onSuccess: () => {
      toast.success("Account aggiunti!");
      void setParams({ step: "banking-categories" }, { shallow: false });
    },
  });

  useEffect(() => {
    setIsExecuting(isExecuting);
  }, [isExecuting, setIsExecuting]);

  if (connections.length === 0) {
    return (
      <div className="whitespace-wrap text-center text-sm text-slate-500">
        Non hai collegato nessun istituto finanziario. <br />
        Potrai farlo in seguito, ma perchè aspettare?
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(execute)}
        className="flex max-w-full flex-col gap-4"
      >
        {connections.map(({ connection, accounts }, index) => (
          <div key={index} className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              {connection.provider === Provider.NONE ? (
                <Landmark className="size-6" />
              ) : (
                <Image
                  src={connection.logoUrl ?? ""}
                  alt={connection.name}
                  width={24}
                  height={24}
                />
              )}
              <span className="font-semibold">{connection.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {accounts.length + " conto"}
              </span>
            </div>
            <ul className="w-full space-y-1">
              {accounts.map((account, accountIndex) => (
                <li
                  key={account.accountId}
                  className="relative flex items-center justify-between gap-3 font-normal"
                >
                  <FormField
                    control={form.control}
                    name={`connections.${index}.accounts.${accountIndex}.name`}
                    render={({ field }) => (
                      <Input {...field} className="w-full" />
                    )}
                  />
                  <span className="text- absolute right-28 font-normal text-muted-foreground">
                    {euroFormat(account.balance ?? "0")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-[57px] h-[38px] rounded-sm text-muted-foreground"
                  >
                    <CircleX className="size-4" />
                  </Button>
                  <FormField
                    control={form.control}
                    name={`connections.${index}.accounts.${accountIndex}.enabled`}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </form>
    </Form>
  );
}
