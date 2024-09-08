"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, Link, PlusCircle } from "lucide-react";
import { useDebounce } from "use-debounce";

import { ConnectBankProvider } from "~/components/connect-bank-provider";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  type getBankConnections,
  type getFilteredInstitutions,
} from "~/server/db/queries/cached-queries";
import { CreateAccountForm } from "./create-account-form";

export default function AccountsStep(props: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
  connections: Awaited<ReturnType<typeof getBankConnections>>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showText = useDebounce(true, 800);

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
            className="grid w-full grid-cols-2 gap-4 pb-4 sm:grid-cols-2"
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
                  {props.connections
                    .filter((connection) => connection.source === "provider")
                    .map((connection) => (
                      <div key={connection.id}>{connection.name}</div>
                    ))}
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
                    <ul className="-mr-4 grid grid-cols-1 gap-1">
                      {props.institutions.map((institution) => (
                        <li key={institution.id} className="flex items-center">
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
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="flex h-full flex-col items-start justify-start gap-4 border p-4"
                  variant={"outline"}
                  size="lg"
                >
                  <div className="flex w-full items-center justify-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Traccia a mano
                  </div>
                  {props.connections
                    .filter((connection) => connection.source === "db")
                    .map((connection) => (
                      <div key={connection.id}>{connection.name}</div>
                    ))}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <CreateAccountForm />
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
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/onboarding?step=categories")}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("step", "banking-transactions");
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
