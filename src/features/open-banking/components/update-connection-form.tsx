import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRightIcon,
  CreditCardIcon,
  EllipsisIcon,
  Loader2Icon,
  QrCodeIcon,
  WalletIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { updateConnectedAccountAction } from "../server/actions";
import { type getConnectionsWithAccountsForUser } from "../server/queries";
import { ConnectionUpdateSchema } from "../utils/schemas";

type ConnectionWithAccounts = Awaited<
  ReturnType<typeof getConnectionsWithAccountsForUser>
>[number];

export default function UpdateConnectionForm({
  connection,
  onComplete,
  className,
}: {
  connection: ConnectionWithAccounts;
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const { execute, isExecuting, reset } = useAction(
    updateConnectedAccountAction,
    {
      onError: ({ error }) => {
        console.error(error);
        toast.error(error.serverError);
      },
      onSuccess: ({ data }) => {
        console.log(data?.message);
        toast.success(data?.message);
        reset();
        onComplete();
      },
    },
  );

  const form = useForm<z.infer<typeof ConnectionUpdateSchema>>({
    resolver: zodResolver(ConnectionUpdateSchema),
    defaultValues: { ...connection },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <ul className="space-y-4">
          {connection.accounts.map((account) => (
            <li
              key={account.id}
              className={cn(
                "group flex items-center justify-between",
                "py-1",
                "transition-all duration-200",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn("rounded-lg p-1.5", {
                    "bg-emerald-100 dark:bg-emerald-900/30":
                      account.type === "savings",
                    "bg-blue-100 dark:bg-blue-900/30":
                      account.type === "checking",
                    "bg-purple-100 dark:bg-purple-900/30":
                      account.type === "investment",
                  })}
                >
                  {account.type === "savings" && (
                    <WalletIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {account.type === "checking" && (
                    <QrCodeIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  {account.type === "investment" && (
                    <ArrowUpRightIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                  {account.type === "debt" && (
                    <CreditCardIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  {account.description && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {account.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {account.balance}
                </span>

                <Switch />

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button className="w-full" type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Modifico connessione...
              </>
            ) : (
              "Modifica connessione"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
