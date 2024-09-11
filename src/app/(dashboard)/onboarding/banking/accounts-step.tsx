"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type getPendingBankConnections } from "~/lib/data";
import { type getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { CreateAccountForm } from "./_components/create-account-form";
import SearchInstitution from "./_components/search-institution";
import { SelectAccountForm } from "./_components/select-account-form";
import { useSearchParams } from "./_hooks/use-search-params";

export default function AccountsStep(props: {
  institutions: Awaited<ReturnType<typeof getFilteredInstitutions>>;
  connections: Awaited<ReturnType<typeof getPendingBankConnections>>;
}) {
  const [isExecuting, setIsExecuting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [, setParams] = useSearchParams();

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
                <SelectAccountForm
                  formRef={formRef}
                  connections={props.connections}
                  setIsExecuting={setIsExecuting}
                />
              </div>
              <PopoverContent className="w-80" align="center">
                <Tabs defaultValue="account">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="linked">Collega un conto</TabsTrigger>
                    <TabsTrigger value="manual">Traccia a mano</TabsTrigger>
                  </TabsList>
                  <TabsContent value="linked" className="pt-2">
                    <SearchInstitution institutions={props.institutions} />
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
