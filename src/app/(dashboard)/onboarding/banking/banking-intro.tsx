"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Coins } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useSearchParams } from "./_hooks/use-search-params";

export default function BankingIntro() {
  const [, setParams] = useSearchParams();

  const handleNext = () => {
    void setParams({ step: "banking-accounts" }, { shallow: false });
  };

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-center justify-center gap-10 px-3"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
        className="flex max-w-[-webkit-fill-available] flex-1 flex-col items-center justify-center space-y-8 text-center sm:flex-grow-0"
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
          <Coins className="mr-4 size-10" />
          Liquidità
        </motion.h1>
        <motion.p
          className="max-w-md text-muted-foreground transition-colors sm:text-lg"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Prima di iniziare, ti chiediamo di condividere alcune informazioni
          sulle tue finanze. Il nostro obiettivo è aiutarti a gestirle al
          meglio.
        </motion.p>
      </motion.div>
      <motion.div
        className="flex w-full justify-center gap-4"
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
          onClick={() => setParams({ step: "features" }, { shallow: false })}
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
        <Button onClick={handleNext} className="w-full sm:w-auto">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Iniziamo
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <ArrowRight className="ml-2 size-4" />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
}
