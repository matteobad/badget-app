import { useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX, Landmark } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { euroFormat } from "~/lib/utils";
import { upsertBankConnectionBulkSchema } from "~/lib/validators";
import { upsertBankConnectionBulkAction } from "~/server/actions/connect-bank-account-action";
import { Provider } from "~/server/db/schema/enum";
import { useConnections } from "../_hooks/use-banking";
import { useSearchParams } from "../_hooks/use-search-params";

export function SelectAccountForm({
  formRef,
  setIsExecuting,
}: {
  formRef: React.RefObject<HTMLFormElement>;
  setIsExecuting: (isExecuting: boolean) => void;
}) {
  const connections = useConnections();
  const [, setParams] = useSearchParams();

  const form = useForm<z.infer<typeof upsertBankConnectionBulkSchema>>({
    resolver: zodResolver(upsertBankConnectionBulkSchema),
    defaultValues: {
      connections: connections.map(({ bankAccount, ...connection }) => ({
        connection,
        accounts: bankAccount.map((account) => ({
          ...account,
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
        {JSON.stringify(form.formState.errors, null, 2)}
        {connections.map(({ bankAccount: accounts, ...connection }, index) => (
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
            <ul className="mb-2 w-full space-y-2">
              {accounts.map((account, accountIndex) => (
                <li
                  key={account.accountId}
                  className="relative flex items-center justify-between gap-4 font-normal"
                >
                  <span className="flex-1 text-left">{account.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {euroFormat(account.balance ?? "0")}
                  </span>
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
            {index !== connections.length - 1 && <Separator />}
          </div>
        ))}
      </form>
    </Form>
  );
}
