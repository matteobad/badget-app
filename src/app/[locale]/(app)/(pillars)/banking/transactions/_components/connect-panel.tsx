"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { TransactionImportSchema } from "~/lib/validators";
import { importTransactionAction } from "~/server/actions";
import { type DB_InstitutionType } from "~/server/db/schema/institutions";

const countries = [
  {
    continent: "America",
    items: [
      { value: "1", label: "United States", flag: "🇺🇸" },
      { value: "2", label: "Canada", flag: "🇨🇦" },
      { value: "3", label: "Mexico", flag: "🇲🇽" },
    ],
  },
  {
    continent: "Africa",
    items: [
      { value: "4", label: "South Africa", flag: "🇿🇦" },
      { value: "5", label: "Nigeria", flag: "🇳🇬" },
      { value: "6", label: "Morocco", flag: "🇲🇦" },
    ],
  },
  {
    continent: "Asia",
    items: [
      { value: "7", label: "China", flag: "🇨🇳" },
      { value: "8", label: "Japan", flag: "🇯🇵" },
      { value: "9", label: "India", flag: "🇮🇳" },
    ],
  },
  {
    continent: "Europe",
    items: [
      { value: "10", label: "United Kingdom", flag: "🇬🇧" },
      { value: "11", label: "France", flag: "🇫🇷" },
      { value: "12", label: "Germany", flag: "🇩🇪" },
    ],
  },
  {
    continent: "Oceania",
    items: [
      { value: "13", label: "Australia", flag: "🇦🇺" },
      { value: "14", label: "New Zealand", flag: "🇳🇿" },
    ],
  },
];

function ConnectAccountForm({
  className,
  institutions,
}: { institutions: DB_InstitutionType[] } & React.ComponentProps<"form">) {
  const { execute, isExecuting } = useAction(importTransactionAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione creata!");
    },
  });

  const form = useForm<z.infer<typeof TransactionImportSchema>>({
    resolver: zodResolver(TransactionImportSchema),
    defaultValues: {
      settings: { inverted: false },
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col gap-2", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="flex w-full items-center gap-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem
                className={cn("relative flex flex-1 space-y-0", {
                  hidden: !!field.value,
                })}
              >
                <Input
                  placeholder="Cerca la tua banca"
                  className="max-w-sm pe-9 ps-9"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                  <SearchIcon size={16} strokeWidth={2} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={({}) => (
              <FormItem className="w-[180px]">
                <Select defaultValue="2">
                  <SelectTrigger className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 [&>span_svg]:text-muted-foreground/80">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                    {countries.map((continent) => (
                      <SelectGroup key={continent.continent}>
                        <SelectLabel className="ps-2">
                          {continent.continent}
                        </SelectLabel>
                        {continent.items.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            <span className="text-lg leading-none">
                              {item.flag}
                            </span>{" "}
                            <span className="truncate">{item.label}</span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-4">
            {institutions.map((institution) => (
              <React.Fragment key={institution.id}>
                <div className="text-sm">{institution.name}</div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        <div className="flex-grow"></div>
        <Button
          className="col-span-2 mt-4"
          type="submit"
          disabled={isExecuting}
        >
          Importa Transazioni
        </Button>
      </form>
    </Form>
  );
}

export default function ConnectPanel({
  institutions,
}: {
  institutions: DB_InstitutionType[];
}) {
  const isMobile = useIsMobile();
  const [params, setParams] = useQueryStates({ action: parseAsString });
  const open = params.action === "connect";

  const PanelContent = () => (
    <ConnectAccountForm
      className={cn({ "px-4": isMobile })}
      institutions={institutions}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={() => setParams({ action: null })}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Importazione rapida da CSV</DrawerTitle>
            <DrawerDescription>
              Semplifica la gestione, carica il file e verifica i dati.
            </DrawerDescription>
          </DrawerHeader>
          <PanelContent />
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" asChild>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => setParams({ action: null })}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Importazione rapida da CSV</DialogTitle>
            <DialogDescription>
              Semplifica la gestione, carica il file e verifica i dati.
            </DialogDescription>
          </DialogHeader>
          <PanelContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
