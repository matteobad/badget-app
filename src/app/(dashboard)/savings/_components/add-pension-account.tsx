"use client";

import { use, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  PercentIcon,
  PlusIcon,
  TrendingUpIcon,
} from "lucide-react";
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
import { type schema } from "~/server/db";

export function CreatePensionAccountForm(props: {
  pensionFunds: (typeof schema.pensionFunds.$inferSelect & {
    investmentsBranches: (typeof schema.investmentBranches.$inferSelect)[];
  })[];
}) {
  const [selectedPFID, setSelectedPFID] = useState<number>();
  const [selectedIB, setSelectedIB] =
    useState<typeof schema.investmentBranches.$inferSelect>();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useFormState(createPostAction, {
    message: "",
  });

  const form = useForm<z.output<typeof CreatePensionAccountSchema>>({
    resolver: zodResolver(CreatePensionAccountSchema),
    defaultValues: {
      pensionFundId: -1,
      investmentBranchId: -1,
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
              <FormLabel className="flex justify-between">
                Branch
                <div className="grid grid-cols-4 gap-1 divide-x text-xs font-light text-slate-500">
                  {selectedIB ? (
                    <>
                      <div className="flex items-center justify-center gap-1">
                        <span>ISC2</span>
                        {selectedIB?.isc2}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span>ISC5</span>
                        {selectedIB?.isc5}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span>ISC10</span>
                        {selectedIB?.isc10}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span>ISC35</span>
                        {selectedIB?.isc35}
                      </div>
                    </>
                  ) : (
                    <span className="col-span-4">
                      Select a branch to see medium ISCs
                    </span>
                  )}
                </div>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  setSelectedIB(
                    props.pensionFunds
                      .find((pf) => pf.id === selectedPFID)
                      ?.investmentsBranches.find(
                        (ib) => ib.id.toString() === value,
                      ),
                  );
                  field.onChange(value);
                }}
                defaultValue={field.value.toString()}
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
          <CreatePensionAccountForm pensionFunds={pensionFunds} />
        </div>
        {/* <DialogFooter>
          <Button type="submit">Start tracking!</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
