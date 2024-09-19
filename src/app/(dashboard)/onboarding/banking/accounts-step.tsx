"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { CreateAccountDialog } from "./_components/create-account-dialog";
import { SelectAccountForm } from "./_components/select-account-form";
import { useSearchParams } from "./_hooks/use-search-params";

export default function AccountsStep() {
  const [isExecuting, setIsExecuting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [, setParams] = useSearchParams();

  return (
    <motion.div
      className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-3"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
        className="flex flex-1 flex-col items-center justify-center space-y-8 text-center sm:flex-grow-0"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
              type: "spring",
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-cal flex items-center text-4xl font-bold transition-colors sm:text-5xl"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <Layers className="mr-4 size-10" />
          Conti bancari
        </motion.h1>
        <motion.p
          className="max-w-md text-muted-foreground transition-colors sm:text-lg"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Ogni movimento, entrata o uscita, parte dai nostri conti bancari. Con
          Badget potrai collegarli e lasciare il resto a noi. Aggiorneremo ogni
          giorno saldi e transazioni in automatico.
        </motion.p>
        <motion.div
          className="min-w-full"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader className="items-center">
              <CreateAccountDialog />
            </CardHeader>
            <CardContent>
              <SelectAccountForm
                formRef={formRef}
                setIsExecuting={setIsExecuting}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <motion.div
        className="flex w-full items-center justify-between gap-4"
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="visible"
      >
        <Button
          className="w-full sm:w-auto"
          variant="ghost"
          size="lg"
          onClick={() => setParams({ step: "banking" }, { shallow: false })}
        >
          <motion.div
            initial={{ opacity: 0, x: +10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <ArrowLeft className="mr-2 size-4" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: +10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Indietro
          </motion.span>
        </Button>

        <Button
          className="w-full sm:w-auto"
          variant="default"
          size="lg"
          disabled={isExecuting}
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isExecuting ? "Caricamento..." : "Crea conti"}
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
