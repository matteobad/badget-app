"use client";

import { useRef } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CreditCard, Layers, Plus, Search } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { type z } from "zod";

import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type getPendingBankConnections } from "~/lib/data";
import { euroFormat } from "~/lib/utils";
import { upsertBankConnectionBulkSchema } from "~/lib/validators";
import { upsertBankConnectionBulkAction } from "~/server/actions/connect-bank-account-action";
import { type getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { CreateAccountForm } from "./_components/create-account-form";
import { useSearchParams } from "./_hooks/use-search-params";

export default function AccountsStep(props: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
  connections: Awaited<ReturnType<typeof getPendingBankConnections>>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [, setParams] = useSearchParams();

  const showText = useDebounce(true, 800);

  const form = useForm<z.infer<typeof upsertBankConnectionBulkSchema>>({
    resolver: zodResolver(upsertBankConnectionBulkSchema),
    defaultValues: {
      connections: props.connections.map(({ connection, accounts }) => ({
        connection,
        accounts: accounts.map((account) => ({
          ...account,
          enabled: true,
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

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {showText && (
        <motion.div
          variants={{
            show: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="mx-5 flex max-w-[-webkit-fill-available] flex-col items-center space-y-8 text-center sm:mx-auto"
        >
          <motion.h1
            className="font-cal flex items-center text-4xl font-bold transition-colors sm:text-5xl"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            <Layers className="mr-4 size-10" />
            Banking
          </motion.h1>
          <motion.p
            className="max-w-md text-muted-foreground transition-colors sm:text-lg"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            Ogni movimento, entrata o uscita, parte dai nostri conti bancari.
            Tutti ne abbiamo almeno uno e con Badget potrai collegarli e
            lasciare il resto a noi. Aggiorneremo ogni giorno saldi e
            transazioni in automatico.
          </motion.p>
          <motion.div
            className="grid w-full grid-cols-1 gap-4 pb-4"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            <Popover>
              <div className="flex h-full flex-col items-center justify-start gap-4 rounded-md border p-4">
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    disabled={props.connections.length !== 0}
                  >
                    <div className="flex w-full items-center justify-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi un conto
                    </div>
                  </Button>
                </PopoverTrigger>
                <Form {...form}>
                  <form
                    ref={formRef}
                    onSubmit={form.handleSubmit(execute)}
                    className="flex w-[500px] max-w-full flex-col gap-2"
                  >
                    {props.connections.map(
                      ({ connection, accounts }, index) => (
                        <div key={index} className="flex w-full flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Image
                              src={connection.logoUrl ?? ""}
                              alt={connection.name}
                              width={24}
                              height={24}
                            />
                            <span className="font-semibold">
                              {connection.name}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                              {accounts.length + " conto"}
                            </span>
                          </div>
                          <ul className="w-full">
                            {accounts.map((account, accountIndex) => (
                              <li
                                key={account.accountId}
                                className="flex items-center justify-between gap-3 px-1 font-normal"
                              >
                                <CreditCard className="size-5 shrink-0" />
                                <FormField
                                  control={form.control}
                                  name={`connections.${index}.accounts.${accountIndex}.name`}
                                  render={({ field }) => <Input {...field} />}
                                />
                                <span className="flex-1"></span>
                                {euroFormat(account.balance ?? "0")}
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
                        </div>
                      ),
                    )}
                  </form>
                </Form>
              </div>
              <PopoverContent className="w-80" align="center">
                <Tabs defaultValue="account">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="linked">Collega un conto</TabsTrigger>
                    <TabsTrigger value="manual">Traccia a mano</TabsTrigger>
                  </TabsList>
                  <TabsContent value="linked" className="pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="relative grid grid-cols-3 gap-2">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="col-span-2 pl-10"
                          placeholder="Cerca istituzione"
                          type="search"
                          onChange={(e) => {
                            void setParams(
                              { q: e.target.value },
                              { shallow: true },
                            );
                          }}
                        />
                        <Select value="IT">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="ES">ES</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <ScrollArea className="-ml-4 h-[200px]">
                        <ul className="-mr-4 grid grid-cols-1 gap-1">
                          {props.institutions.map((institution) => (
                            <li
                              key={institution.id}
                              className="flex items-center"
                            >
                              <ConnectBankProvider
                                provider={institution.provider}
                                id={institution.id}
                                availableHistory={
                                  institution.availableHistory ?? 90
                                }
                              >
                                <div className="flex h-12 w-full items-center justify-start gap-2 rounded-none pl-4 text-left text-sm font-normal hover:bg-muted">
                                  <Avatar className="h-8 w-8 rounded-none">
                                    <AvatarImage src={institution.logo ?? ""} />
                                    <AvatarFallback>
                                      {institution.name}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="w-[80%] truncate">
                                    {institution.name}
                                  </span>
                                </div>
                              </ConnectBankProvider>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  <TabsContent value="manual" className="pt-2">
                    <CreateAccountForm />
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </motion.div>
          <motion.div
            className="flex w-full justify-end pt-6"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                setParams({ step: "features" }, { shallow: false })
              }
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="ghost"
              size="lg"
              onClick={() =>
                void setParams(
                  { step: "banking-categories" },
                  { shallow: false },
                )
              }
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              disabled={isExecuting}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
            >
              <span className="w-full text-center font-bold">
                {isExecuting ? "Caricamento..." : "Avanti"}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
