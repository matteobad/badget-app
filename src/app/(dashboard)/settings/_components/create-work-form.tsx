"use client";

import { useEffect, useRef, useActionState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import type { CreateWorkSchema } from "~/lib/validators";
import MoneyInput from "~/components/custom/money-input";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CreatePostSchema } from "~/lib/validators";
import { createWorkAction } from "~/server/actions/working-records.action";
import { ContractType } from "~/server/db/schema/working-records";

export function CreateWorkForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(createWorkAction, {
    message: "",
  });

  const form = useForm<z.output<typeof CreateWorkSchema>>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      company: undefined,
      contract: ContractType.PERMANENT,
      date: {
        from: new Date(),
        to: undefined,
      },
      ...(state?.fields ?? {}),
    },
  });

  // NOTE: use effect could be avoided if we inline error message in the form
  useEffect(() => {
    if (state.message && state.errors) toast.error(state.message);
    if (state.message && !state.errors) toast.success(state.message);
  }, [state]);

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-lg flex-col gap-4"
        ref={formRef}
        action={formAction}
        onSubmit={(evt) => {
          evt.preventDefault();
          void form.handleSubmit(() => {
            formAction(new FormData(formRef.current!));
          })(evt);
        }}
      >
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vercel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contract"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Permanent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 items-end gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Period</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "justify-start pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL, y")} -{" "}
                              {format(field.value.to, "LLL, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <MoneyInput form={form} label="RAL" name="ral" placeholder="50.000" />
        </div>
        <div className="mt-2 flex gap-4 self-end">
          <Button type="button" variant="outline">
            <Link href="/account/work">Cancel</Link>
          </Button>
          <Button>Add Record</Button>
        </div>
      </form>
    </Form>
  );
}
