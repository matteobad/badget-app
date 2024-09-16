"use client";

import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useSearchParams } from "./_hooks/use-search-params";

export default function BankingIntro() {
  const [, setParams] = useSearchParams();

  const handleNext = () => {
    void setParams({ step: "banking-accounts" }, { shallow: false });
  };

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <motion.div
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
        className="mx-5 flex max-w-[-webkit-fill-available] flex-col items-center space-y-8 text-center sm:mx-auto"
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
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <Button onClick={handleNext}>
            <span>Iniziamo</span>
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
