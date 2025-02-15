"use client";

import React, { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, Loader2Icon, SearchIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { ConnectGocardlessSchema } from "~/lib/validators";
import { connectGocardlessAction } from "~/server/actions";
import { type DB_InstitutionType } from "~/server/db/schema/institutions";

const countries = [
  {
    continent: "Europe",
    items: [{ value: "IT", label: "Italy", flag: "🇮🇹" }],
  },
];

function ConnectAccountForm({
  className,
  institutions,
}: { institutions: DB_InstitutionType[] } & React.ComponentProps<"form">) {
  const { execute, isExecuting } = useAction(connectGocardlessAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: () => {
      console.log("Connessione iniziata!");
      toast.success("Connessione iniziata!");
    },
  });

  const form = useForm<z.infer<typeof ConnectGocardlessSchema>>({
    resolver: zodResolver(ConnectGocardlessSchema),
    defaultValues: {
      provider: "GOCARDLESS",
      redirectBase: window.location.origin,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col gap-2", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="flex w-full items-center gap-2">
          <div className={cn("relative flex flex-1 space-y-0")}>
            <Input
              placeholder="Cerca la tua banca"
              className="max-w-sm pe-9 ps-9"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <SearchIcon size={16} strokeWidth={2} />
            </div>
            <FormMessage />
          </div>

          <FormField
            control={form.control}
            name="countryCode"
            render={({}) => (
              <FormItem className="w-[180px]">
                <Select defaultValue="IT">
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

        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {institutions.length === 0 ? (
            <div className="mx-auto flex h-60 flex-col items-center justify-center text-center">
              <Landmark />

              <h3 className="mt-4 text-lg font-semibold">
                Nessun conto collegabile
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Prova a selezionare un altro paese dalla lista
              </p>
            </div>
          ) : (
            institutions.map((institution) => (
              <React.Fragment key={institution.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="rounded-none border">
                    <AvatarImage
                      src={institution.logo!}
                      alt={`${institution.name} logo`}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="text-sm">{institution.name}</div>
                    <div className="text-xs lowercase text-muted-foreground">
                      Via {institution.provider}
                    </div>
                  </div>
                  <div className="flex-1"></div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isExecuting}
                    onClick={() => {
                      form.setValue("institutionId", institution.id);
                      formRef.current?.requestSubmit();
                    }}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Connetto...
                      </>
                    ) : (
                      "Connetti"
                    )}
                  </Button>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))
          )}
        </ScrollArea>
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
            <DrawerTitle>Collega il tuo conto bancario</DrawerTitle>
            <DrawerDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
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
            <DialogTitle>Collega il tuo conto bancario</DialogTitle>
            <DialogDescription>
              Connetti in sicurezza e sincronizza le tue transazioni in pochi
              secondi.
            </DialogDescription>
          </DialogHeader>
          <PanelContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
