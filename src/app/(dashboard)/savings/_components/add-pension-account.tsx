"use client";

import { use, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, PercentIcon } from "lucide-react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import MoneyInput from "~/components/custom/money-input";
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
import { createPensionAccountAction } from "~/server/action/pension-account.action";
import { type investmentBranchesSelect, type schema } from "~/server/db";

export function CreatePensionAccountForm(props: {
  pensionFunds: (typeof schema.pensionFunds.$inferSelect & {
    investmentsBranches: investmentBranchesSelect[];
  })[];
}) {
  const [selectedPFID, setSelectedPFID] = useState<number>();
  const [selectedIB, setSelectedIB] = useState<investmentBranchesSelect>();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(createPensionAccountAction, {
    message: "",
  });

  const form = useForm<z.output<typeof CreatePensionAccountSchema>>({
    resolver: zodResolver(CreatePensionAccountSchema),
    defaultValues: {
      pensionFundId: undefined,
      investmentBranchId: undefined,
      joinedAt: new Date(),
      baseTFRPercentage: 0,
      baseEmployeePercentage: 0,
      baseEmployerPercentage: 0,
      baseContribution: "",
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
        className="flex w-full max-w-2xl flex-col gap-4 overflow-auto"
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
          name="pensionFundId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              {/* Hack to post data with server actions */}
              <input type="hidden" name={field.name} value={field.value} />
              <FormLabel>Pension Fund</FormLabel>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "relative w-[full] justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span className="max-w-[93%] truncate">
                        {field.value
                          ? props.pensionFunds.find(
                              (item) => item.id === field.value,
                            )?.name ?? "Select pension fund"
                          : "Select pension fund"}
                      </span>
                      <ChevronsUpDown className="absolute right-3 ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0">
                  <Command>
                    <CommandInput placeholder="Search pension fund..." />
                    <CommandList>
                      <CommandEmpty>No pension fund found.</CommandEmpty>
                      <CommandGroup>
                        {props.pensionFunds.map((pensionFund) => (
                          <CommandItem
                            value={pensionFund.name}
                            key={pensionFund.id}
                            onSelect={() => {
                              setSelectedPFID(pensionFund.id);
                              form.setValue("pensionFundId", pensionFund.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                pensionFund.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {pensionFund.name}
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
            <FormItem className="flex flex-col">
              {/* Hack to post data with server actions */}
              <input type="hidden" name={field.name} value={field.value} />
              <FormLabel className="flex justify-between">
                Branch
                <div className="flex gap-1 divide-x text-xs font-light text-slate-500">
                  {selectedIB ? (
                    <>
                      <div className="flex items-center justify-center gap-1">
                        <span>ISC</span>
                        {selectedIB?.isc35 ??
                          selectedIB?.isc10 ??
                          selectedIB?.isc5 ??
                          selectedIB?.isc2}
                        {"%"}
                      </div>
                    </>
                  ) : (
                    <span>Select a branch to see medium ISCs</span>
                  )}
                </div>
              </FormLabel>
              <Select
                disabled={!selectedPFID}
                onValueChange={(value) => {
                  setSelectedIB(
                    props.pensionFunds
                      .find((pf) => pf.id === selectedPFID)
                      ?.investmentsBranches.find(
                        (ib) => ib.id.toString() === value,
                      ),
                  );
                  field.onChange(parseInt(value, 10));
                }}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedPFID
                    ? props.pensionFunds
                        .find((pf) => pf.id === selectedPFID)
                        ?.investmentsBranches.map((branch) => {
                          return (
                            <SelectItem
                              value={branch.id.toString()}
                              key={branch.id}
                            >
                              {branch.description}
                            </SelectItem>
                          );
                        })
                    : null}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="joinedAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              {/* Hack to post data with server actions */}
              <input
                type="hidden"
                name={field.name}
                value={field.value?.toISOString()}
              />
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
                  <div className="relative">
                    <Input {...field} placeholder="0" />
                    <PercentIcon className="absolute right-3 top-3 h-4 w-4" />
                  </div>
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
                  <div className="relative">
                    <Input {...field} placeholder="Employee contribution (%)" />
                    <PercentIcon className="absolute right-3 top-3 h-4 w-4" />
                  </div>
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
                  <div className="relative">
                    <Input {...field} placeholder="Employer contribution (%)" />
                    <PercentIcon className="absolute right-3 top-3 h-4 w-4" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <MoneyInput
          form={form}
          label="Current Pricipal"
          name="baseContribution"
          placeholder="Current pension account balance"
        />

        <Button className="mt-4 self-end">Start tracking!</Button>
      </form>
    </Form>
  );
}

export function AddPensionAccountDialog(props: {
  pensionFundsPromise: Promise<
    (typeof schema.pensionFunds.$inferSelect & {
      investmentsBranches: (typeof schema.investmentBranches.$inferSelect)[];
    })[]
  >;
}) {
  const pensionFunds = use(props.pensionFundsPromise);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Account</Button>
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
          <CreatePensionAccountForm pensionFunds={pensionFunds} />
        </div>
        {/* <DialogFooter>
          <Button type="submit">Start tracking!</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
