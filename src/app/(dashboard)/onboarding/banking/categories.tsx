"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  PartyPopper,
  PiggyBank,
  Plus,
  Shapes,
} from "lucide-react";
import { useDebounce } from "use-debounce";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function Categories() {
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
            <Shapes className="mr-4 size-10" />
            Categorie
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
            <Button
              className="flex h-full flex-col items-start justify-start gap-4 border p-4"
              variant="outline"
              size="lg"
              onClick={() => router.push("/onboarding?step=banking")}
            >
              <span className="w-full text-center font-bold">
                Voglia farla semplice
              </span>
              <ul className="w-full text-left font-light">
                <li className="flex items-center">
                  <ArrowLeft className="mr-2 size-3" /> Entrate
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowRight className="mr-2 size-3" /> Uscite
                  <span className="ml-auto">100%</span>
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowLeftRight className="mr-2 size-3" /> Trasferimenti
                </li>
              </ul>
            </Button>
            <Button
              className="flex h-full flex-col items-start justify-start gap-4 border p-4"
              variant="secondary"
              size="lg"
              onClick={() => router.push("/onboarding?step=savings")}
            >
              <span className="w-full text-center font-bold">50/30/20</span>
              <ul className="w-full text-left font-light">
                <li className="flex items-center">
                  <Banknote className="mr-2 size-3" /> Stipendio
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowRight className="mr-2 size-3" /> Necessità
                  <span className="ml-auto">50%</span>
                </li>
                <li className="flex items-center">
                  <PartyPopper className="mr-2 size-3" /> Svago
                  <span className="ml-auto">30%</span>
                </li>
                <li className="flex items-center">
                  <PiggyBank className="mr-2 size-3" /> Risparmio
                  <span className="ml-auto">20%</span>
                </li>
                <Separator className="my-2" />
                <li className="flex items-center">
                  <ArrowLeftRight className="mr-2 size-3" /> Trasferimenti
                </li>
              </ul>
            </Button>
            <Button
              className="flex h-full flex-col items-start justify-start gap-4 border p-4"
              variant="outline"
              size="lg"
              onClick={() => router.push("/onboarding?step=savings")}
            >
              <span className="w-full text-center font-bold">
                So quello che faccio
              </span>
              <div className="font-light">
                <ul className="text-left">
                  <li className="flex items-center">
                    <Plus className="mr-2 size-3" /> Crea categorie
                  </li>
                </ul>
              </div>
            </Button>
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
              onClick={() => router.push("/onboarding?step=banking-done")}
            >
              <span className="w-full text-center font-bold">Salta</span>
            </Button>
            <span className="flex-1"></span>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/onboarding?step=banking")}
            >
              <span className="w-full text-center font-bold">
                Torna indietro
              </span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => router.push("/onboarding?step=rules")}
            >
              <span className="w-full text-center font-bold">Conferma</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
