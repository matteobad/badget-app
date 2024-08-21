"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { toggleBankAccountSchema } from "~/lib/validators";
import { toggleBankAccountAction } from "~/server/actions/bank-account.action";

type ToggleBankAccountSwitchProps = {
  id: number;
  enabled: boolean;
};

export function ToggleBankAccountSwitchProps({
  id,
  enabled,
}: ToggleBankAccountSwitchProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const toggleAction = useAction(toggleBankAccountAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
  });

  const form = useForm<z.output<typeof toggleBankAccountSchema>>({
    resolver: zodResolver(toggleBankAccountSchema),
    defaultValues: {
      id,
      enabled,
    },
  });

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(toggleAction.execute)}>
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(e) => {
                    field.onChange(e);
                    formRef.current?.requestSubmit();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
