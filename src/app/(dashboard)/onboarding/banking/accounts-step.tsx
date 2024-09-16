"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Layers } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { type getPendingBankConnections } from "~/lib/data";
import { type getFilteredInstitutions } from "~/server/db/queries/cached-queries";
import { CreateAccountDialog } from "./_components/create-account-dialog";
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
            Conti bancari
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
            <Card>
              <CardHeader>
                <CreateAccountDialog
                  connections={props.connections}
                  institutions={props.institutions}
                />
              </CardHeader>
              <CardContent>
                <SelectAccountForm
                  formRef={formRef}
                  setIsExecuting={setIsExecuting}
                  connections={props.connections}
                />
              </CardContent>
            </Card>
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
              onClick={() => setParams({ step: "banking" }, { shallow: false })}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="default"
              size="lg"
              disabled={isExecuting}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
            >
              <span className="w-full text-center font-bold">
                {isExecuting ? "Caricamento..." : "Crea conti"}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
