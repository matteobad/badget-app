"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, Layers, Link, PlusCircle } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { euroFormat } from "~/lib/utils";
import { type getUserBankConnections } from "~/server/db/queries/cached-queries";
import { Provider } from "~/server/db/schema/enum";
import { CreateAccountForm } from "./create-account-form";

export default function Banking(props: {
  children: React.ReactNode;
  connections: Awaited<ReturnType<typeof getUserBankConnections>>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showText = useDebounce(true, 800);

  const linkedAccounts = props.connections.filter(
    (connection) => connection.provider !== Provider.NONE,
  );

  const manualAccounts = props.connections.filter(
    (connection) => connection.provider === Provider.NONE,
  );

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
          className="mx-5 flex flex-col items-center space-y-8 text-center sm:mx-auto"
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
            className="grid grid-cols-2 gap-4 pb-4"
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
              <PopoverTrigger asChild>
                <Button
                  className="flex h-full flex-col items-start justify-start gap-4 border p-4"
                  variant="outline"
                  size="lg"
                >
                  <div className="flex w-full items-center justify-center">
                    <Link className="mr-2 h-4 w-4" />
                    Collega un conto
                  </div>
                  {linkedAccounts.map((connection) => {
                    return connection.bankAccount.map((account) => {
                      return <div key={account.id}>{account.name}</div>;
                    });
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="center">
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Cerca istituzione"
                    onChange={(e) => {
                      const params = new URLSearchParams(searchParams);
                      params.set("q", e.target.value);
                      router.replace(`${pathname}?${params.toString()}`);
                    }}
                  />
                  <ScrollArea className="-ml-4 h-[200px]">
                    <Suspense fallback={<div>Caricamento...</div>}>
                      {props.children}
                    </Suspense>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="flex h-full flex-col items-start justify-start gap-4 border p-4"
                  variant={"outline"}
                  size="lg"
                >
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Traccia manualmente
                  </div>
                  {manualAccounts.map((connection) => {
                    return connection.bankAccount.map((account) => {
                      return (
                        <div
                          key={account.id}
                          className="flex w-full items-center font-light"
                        >
                          <Building2 className="mr-2 size-3" />
                          {account.name}
                          <span className="flex-1 text-right">
                            {euroFormat(account.balance ?? "0")}
                          </span>
                        </div>
                      );
                    });
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <CreateAccountForm />
              </PopoverContent>
            </Popover>
          </motion.div>
          <motion.div
            className="flex w-full justify-end gap-4"
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
              variant="ghost"
              size="lg"
              onClick={() => router.push("/onboarding?step=categories")}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <span className="flex-1"></span>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/onboarding?step=features")}
            >
              <span className="w-full text-center font-bold">
                Torna indietro
              </span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("step", "banking-categories");
                router.replace(`${pathname}?${params.toString()}`);
              }}
            >
              <span className="w-full text-center font-bold">Conferma</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
