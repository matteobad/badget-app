"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, Receipt } from "lucide-react";
import { useDebounce } from "use-debounce";
import { date } from "zod";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { type Transaction } from "~/server/db";

export default function Transactions() {
  const [transaction, setTransaction] = useState<Transaction>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
            <Receipt className="mr-4 size-10" />
            Transazioni
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
            Le transazioni sono il cuore del nostro sistema. Penseremo noi a
            gestirle per tutti i tuoi conti collegati, ma sei comunque libero di
            effettuare operazioni manuali. Pensa a tutti i pagamenti in
            contanti!
          </motion.p>
          <motion.div
            className="flex flex-col gap-4"
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
                  <span className="w-full text-center font-bold">
                    Ultime transazioni
                  </span>
                  <ul className="w-[240px] text-left font-light">
                    <li className="flex items-baseline">
                      <span className="mr-2 text-xs text-slate-700">12/08</span>{" "}
                      Cena fuori
                      <span className="ml-auto">-100,00 €</span>
                    </li>
                  </ul>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="center">
                <div className="flex w-full flex-col gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(transaction?.date ?? new Date(), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={transaction?.date}
                        onSelect={(date) =>
                          setTransaction({ ...transaction, date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="text"
                    placeholder="Descrizione"
                    value={transaction?.name}
                    onChange={(e) =>
                      setTransaction({ ...transaction, name: e.target.value })
                    }
                  />
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="flex w-full justify-between gap-4">
                    <Input
                      type="text"
                      className="w-full text-right"
                      placeholder="100,00"
                      value={transaction?.amount}
                      onChange={(e) =>
                        setTransaction({
                          ...transaction,
                          amount: e.target.value,
                        })
                      }
                    />
                    <Select value="EUR">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("step", "banking-accounts");
                router.replace(`${pathname}?${params.toString()}`);
              }}
            >
              <span className="w-full text-center font-bold">Indietro</span>
            </Button>
            <span className="flex-1"></span>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("step", "banking-categories");
                router.replace(`${pathname}?${params.toString()}`);
              }}
            >
              <span className="w-full text-center font-bold">Salta</span>
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
              <span className="w-full text-center font-bold">Avanti</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
