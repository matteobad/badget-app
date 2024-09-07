"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CandlestickChart, Layers, Leaf, PiggyBank } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";

export default function Features() {
  const router = useRouter();

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
          className="mx-5 flex flex-col items-center space-y-6 text-center sm:mx-auto"
        >
          <motion.h1
            className="font-cal text-4xl font-bold transition-colors sm:text-5xl"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            Cosa Facciamo?
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
            Badget. è il centro di controllo delle tue finanze personali. <br />
            <br />
            Ti daremo una vista d&apos;insieme del tuo patrimonio, dalle spese,
            ai risparmi, agli investimenti e non solo! Offrendoti informazioni
            chiare che ti aiuteranno a prendere decisioni informate.
          </motion.p>
          <motion.div
            className="grid grid-cols-2 gap-4"
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
              variant="default"
              size="lg"
              onClick={() => router.push("/onboarding?step=banking-accounts")}
            >
              <Layers className="mr-2 h-4 w-4" />
              Banking
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled
              onClick={() => router.push("/onboarding?step=savings")}
            >
              <PiggyBank className="mr-2 h-4 w-4" />
              Risparmi
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled
              onClick={() => router.push("/onboarding?step=pension")}
            >
              <Leaf className="mr-2 h-4 w-4" />
              Pensione
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled
              onClick={() => router.push("/onboarding?step=investments")}
            >
              <CandlestickChart className="mr-2 h-4 w-4" />
              Investimenti
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
