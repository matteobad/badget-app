"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { createPostAction } from "~/app/actions";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { CreatePensionAccountSchema } from "~/lib/validators";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const;

export function CreatePensionAccountForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(createPostAction, {
    message: "",
  });

  const form = useForm<z.output<typeof CreatePensionAccountSchema>>({
    resolver: zodResolver(CreatePensionAccountSchema),
    defaultValues: {
      pensionFundId: "",
      investmentBranchId: "",
      baseTFRPercentage: 0,
      baseEmployeePercentage: 0,
      baseEmployerPercentage: 0,
      joinedAt: new Date(),
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
        className="flex w-full max-w-2xl flex-col gap-4"
        ref={formRef}
        action={formAction}
        onSubmit={(evt) => {
          evt.preventDefault();
          void form.handleSubmit(() => {
            formAction(new FormData(formRef.current!));
          })(evt);
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pensionFundId"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Pension Fund</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-[full] justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? languages.find(
                              (language) => language.value === field.value,
                            )?.label
                          : "Select pension fund"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search pension fund..." />
                      <CommandList>
                        <CommandEmpty>No pension fund found.</CommandEmpty>
                        <CommandGroup>
                          {languages.map((pensionFund) => (
                            <CommandItem
                              value={pensionFund.label}
                              key={pensionFund.value}
                              onSelect={() => {
                                form.setValue(
                                  "pensionFundId",
                                  pensionFund.value,
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  pensionFund.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {pensionFund.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="investmentBranchId"
            render={({ field }) => (
              <FormItem className="col-span-1 flex flex-col">
                <FormLabel>Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="joinedAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of registration</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="baseTFRPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TFR</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baseEmployeePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Employee contribution (%)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baseEmployerPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employer</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Employer contribution (%)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="mt-4 self-end">Start tracking!</Button>
      </form>
    </Form>
  );
}

export function AddPensionAccountDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Pension Fund</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Pension Fund</DialogTitle>
          <DialogDescription>
            To reliably track you pension account we need some informations.
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pt-4">
          <CreatePensionAccountForm />
        </div>
        {/* <DialogFooter>
          <Button type="submit">Start tracking!</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
