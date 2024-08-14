"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CreatePensionAccountSchema } from "~/lib/validators";
import { createPensionAccountFormAction } from "~/server/actions/pension-account.action";
import {
  type investmentBranchesSelect,
  type PensionFundsSelect,
} from "~/server/db";
import { Badge } from "../ui/badge";

type PensionFundWithBranches = PensionFundsSelect & {
  investmentsBranches: investmentBranchesSelect[];
};

export function CreatePensionAccountForm(props: {
  pensionFunds: PensionFundWithBranches[];
}) {
  const router = useRouter();

  const [selectedPF, setSelectedPF] = useState<PensionFundWithBranches>();
  const [selectedIB, setSelectedIB] = useState<investmentBranchesSelect>();

  const form = useForm<z.output<typeof CreatePensionAccountSchema>>({
    resolver: zodResolver(CreatePensionAccountSchema),
    defaultValues: {
      pensionFundId: undefined,
      investmentBranchId: undefined,
      joinedAt: new Date(),
      baseContribution: undefined,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 overflow-auto"
        onSubmit={form.handleSubmit(async (data) => {
          const result = await createPensionAccountFormAction(data);

          if (result?.data?.message) {
            // navigate to next step
            router.push("/savings?step=choice-base");
          }
        })}
      >
        <div className="flex flex-1 flex-col justify-center gap-8">
          <header className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold">Fondo Pensione</h2>
            <p className="text-center font-light text-slate-700">
              Ci servono alcune info per iniziare a tracciare il meglio
              possibile la tua previdenza complementare!
            </p>
          </header>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="pensionFundId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  {/* Hack to post data with server actions */}
                  <input type="hidden" name={field.name} value={field.value} />
                  <FormLabel>Fondo Pensione</FormLabel>
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
                          <div className="flex w-full gap-2">
                            <span className="max-w-[75%] truncate">
                              {field.value
                                ? props.pensionFunds.find(
                                    (item) => item.id === field.value,
                                  )?.name ?? "Seleziona un fondo"
                                : "Seleziona un fondo"}
                            </span>
                            {selectedIB && (
                              <Badge variant="outline">
                                {selectedIB.category}
                              </Badge>
                            )}
                          </div>
                          <ChevronsUpDown className="absolute right-3 ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[375px] p-0">
                      {selectedPF === undefined ? (
                        <Command>
                          <CommandInput placeholder="Cerca un fondo..." />
                          <CommandList>
                            <CommandEmpty>Fondo non trovato.</CommandEmpty>
                            <CommandGroup>
                              {props.pensionFunds.map((pensionFund) => (
                                <CommandItem
                                  value={pensionFund.id.toString()}
                                  key={pensionFund.id}
                                  onSelect={() => {
                                    setSelectedPF(pensionFund);
                                    setSelectedIB(undefined);
                                    form.setValue(
                                      "pensionFundId",
                                      pensionFund.id,
                                    );
                                    form.resetField("investmentBranchId");
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
                      ) : (
                        <Command>
                          <div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPF(undefined)}
                            >
                              <ArrowLeftIcon className="h-3 w-3" />
                            </Button>
                            <span className="text-sm text-slate-500">
                              Seleziona in ramo di investimento
                            </span>
                          </div>
                          <CommandList>
                            <CommandEmpty>Comparto non trovato.</CommandEmpty>
                            <CommandGroup>
                              {selectedPF?.investmentsBranches.map((branch) => (
                                <CommandItem
                                  value={branch.id.toString()}
                                  key={branch.id}
                                  onSelect={() => {
                                    setSelectedIB(branch);
                                    form.setValue(
                                      "investmentBranchId",
                                      branch.id,
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      branch.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {branch.description}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-4">
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
                    <FormLabel>Sottoscrizione</FormLabel>
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
                            {field.value ? (
                              format(field.value, "PPP", { locale: it })
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4" />
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
              <MoneyInput
                form={form}
                label="Saldo Corrente"
                name="baseContribution"
                placeholder="10.000,00"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 self-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button>Crea Account</Button>
        </div>
      </form>
    </Form>
  );
}
