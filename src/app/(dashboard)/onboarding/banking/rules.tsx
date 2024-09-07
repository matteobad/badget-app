"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PencilRuler, Shapes } from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";

export default function Rules() {
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
            <PencilRuler className="mr-4 size-10" />
            Regole
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
            Il primo passo è prendere consapevolezza delle proprie spese. Per
            farlo possiamo creare delle categorie. Ogni persona ha esigenze
            diverse perciò offriamo completa personalizzazione.
          </motion.p>
          <motion.div
            className="grid grid-cols-3 gap-4 pb-4"
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, type: "spring" },
              },
            }}
          >
            TODO
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
              onClick={() => router.push("/onboarding?step=banking-categories")}
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/onboarding?step=banking-done")}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              // onClick={() => {
              //   execute({ categories });
              // }}
              // disabled={isExecuting}
            >
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
