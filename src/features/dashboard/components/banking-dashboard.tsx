"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
// import { AreaChart, BarChart, PieChart } from "~/components/ui/chart";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  CalendarIcon,
  DollarSignIcon,
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UtensilsIcon,
  WifiIcon,
  ZapIcon,
} from "lucide-react";
import { type DateRange } from "react-day-picker";

import { ExpensesDistributionChart } from "./charts/expenses-distribution-chart";
import { IncomeDistributionChart } from "./charts/income-distribution-chart";
import { ExpenseCard } from "./expense-card";
import { IncomeCard } from "./income-card";
import { SavingsCard } from "./savings-card";

export function BankingDashboard() {
  // const [transactions, categories] = use(promises);

  const [, setView] = useState("overview");
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Primo Pilastro</h1>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[250px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setView}
      >
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="income">Entrate</TabsTrigger>
          <TabsTrigger value="expenses">Uscite</TabsTrigger>
          <TabsTrigger value="savings">Risparmio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <IncomeCard dateRange={date} transactions={[]} categories={[]} />

            <ExpenseCard dateRange={date} transactions={[]} categories={[]} />

            <SavingsCard dateRange={date} transactions={[]} categories={[]} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <IncomeDistributionChart
              dateRange={date}
              transactions={[]}
              categories={[]}
            />
            <ExpensesDistributionChart
              dateRange={date}
              transactions={[]}
              categories={[]}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transazioni recenti</CardTitle>
                  <CardDescription>Le tue ultime 5 transazioni</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Vedi tutte
                </Button>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagamenti in arrivo</CardTitle>
                <CardDescription>Prossimi 7 giorni</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingPayments />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Gestisci pagamenti ricorrenti
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi delle entrate</CardTitle>
              <CardDescription>
                Dettaglio delle tue fonti di reddito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi delle spese</CardTitle>
              <CardDescription>
                Dettaglio delle tue categorie di spesa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpensesAnalysis />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecentTransactions() {
  // Mock data for recent transactions
  const transactions = [
    {
      id: "t1",
      description: "Supermercato Conad",
      amount: -87.45,
      date: "Oggi, 15:30",
      category: "Alimentari",
      icon: <ShoppingCartIcon className="h-4 w-4" />,
      iconBg:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    },
    {
      id: "t2",
      description: "Netflix Abbonamento",
      amount: -12.99,
      date: "Ieri, 09:15",
      category: "Svago",
      icon: <WifiIcon className="h-4 w-4" />,
      iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
    },
    {
      id: "t3",
      description: "Stipendio Azienda XYZ",
      amount: 2450.0,
      date: "25 Giu, 08:00",
      category: "Stipendio",
      icon: <DollarSignIcon className="h-4 w-4" />,
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
    },
    {
      id: "t4",
      description: "Ristorante Da Mario",
      amount: -68.5,
      date: "24 Giu, 21:45",
      category: "Ristoranti",
      icon: <UtensilsIcon className="h-4 w-4" />,
      iconBg:
        "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400",
    },
    {
      id: "t5",
      description: "Zara Shopping",
      amount: -129.95,
      date: "23 Giu, 16:20",
      category: "Shopping",
      icon: <ShoppingBagIcon className="h-4 w-4" />,
      iconBg:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${transaction.iconBg}`}>
              {transaction.icon}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {transaction.date}
                </p>
                <Badge variant="outline" className="h-5 py-0 text-xs">
                  {transaction.category}
                </Badge>
              </div>
            </div>
          </div>
          <p
            className={`font-medium ${transaction.amount > 0 ? "text-emerald-500" : ""}`}
          >
            {transaction.amount > 0 ? "+" : ""}€
            {Math.abs(transaction.amount).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

function UpcomingPayments() {
  // Mock data for upcoming payments
  const payments = [
    {
      id: "p1",
      description: "Affitto",
      amount: 850.0,
      date: "01 Lug",
      icon: <HomeIcon className="h-4 w-4" />,
      iconBg:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
    },
    {
      id: "p2",
      description: "Rata Mutuo",
      amount: 450.0,
      date: "05 Lug",
      icon: <HomeIcon className="h-4 w-4" />,
      iconBg:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
    },
    {
      id: "p3",
      description: "Bolletta Luce",
      amount: 85.3,
      date: "07 Lug",
      icon: <ZapIcon className="h-4 w-4" />,
      iconBg:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    },
  ];

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${payment.iconBg}`}>
              {payment.icon}
            </div>
            <div>
              <p className="font-medium">{payment.description}</p>
              <p className="text-xs text-muted-foreground">{payment.date}</p>
            </div>
          </div>
          <p className="font-medium">€{payment.amount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

function IncomeAnalysis() {
  // Mock data for income analysis
  const incomeData = [
    { source: "Stipendio", amount: 2450, percentage: 50.5 },
    { source: "Freelance", amount: 1200, percentage: 24.7 },
    { source: "Affitto attivo", amount: 800, percentage: 16.5 },
    { source: "Dividendi", amount: 250, percentage: 5.2 },
    { source: "Altro", amount: 150, percentage: 3.1 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-medium">Fonti di reddito</h3>
          <div className="space-y-4">
            {incomeData.map((income) => (
              <div key={income.source} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{income.source}</span>
                  <span>€{income.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={income.percentage} className="h-2" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {income.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Trend mensile</h3>
          <div className="h-[250px]">
            {/* <BarChart
              data={monthlyTrend}
              index="month"
              categories={["amount"]}
              colors={["#10b981"]}
              valueFormatter={(value) => `€${value.toLocaleString()}`}
              yAxisWidth={60}
            /> */}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">
          Suggerimenti per aumentare le entrate
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
              <TrendingUpIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">Diversifica le fonti di reddito</h4>
              <p className="text-sm text-muted-foreground">
                Il 50.5% delle tue entrate proviene dallo stipendio. Considera
                di aumentare le attività freelance o gli investimenti per
                diversificare.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <DollarSignIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">Ottimizza gli investimenti</h4>
              <p className="text-sm text-muted-foreground">
                I tuoi dividendi rappresentano solo il 5.2% delle entrate.
                Valuta di rivedere la tua strategia di investimento per
                aumentare i rendimenti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpensesAnalysis() {
  // Mock data for expenses analysis
  const expensesByCategory = [
    { category: "Casa", amount: 1200, percentage: 39.7, trend: "+2.1%" },
    { category: "Alimentari", amount: 650, percentage: 21.5, trend: "-3.5%" },
    { category: "Trasporti", amount: 350, percentage: 11.6, trend: "+1.2%" },
    { category: "Utenze", amount: 280, percentage: 9.3, trend: "+5.8%" },
    { category: "Svago", amount: 320, percentage: 10.6, trend: "-1.7%" },
    { category: "Shopping", amount: 226, percentage: 7.5, trend: "+32.4%" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-medium">Spese per categoria</h3>
          <div className="space-y-4">
            {expensesByCategory.map((expense) => (
              <div key={expense.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{expense.category}</span>
                  <div className="flex items-center gap-2">
                    <span>€{expense.amount}</span>
                    <span
                      className={`text-xs ${expense.trend.startsWith("+") ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {expense.trend}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={expense.percentage} className="h-2" />
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {expense.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Trend mensile</h3>
          <div className="h-[250px]">
            {/* <BarChart
              data={monthlyTrend}
              index="month"
              categories={["amount"]}
              colors={["#f43f5e"]}
              valueFormatter={(value) => `€${value.toLocaleString()}`}
              yAxisWidth={60}
            /> */}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Opportunità di risparmio</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">Spese per shopping in aumento</h4>
              <p className="text-sm text-muted-foreground">
                Le tue spese per shopping sono aumentate del 32.4% rispetto al
                mese scorso. Considera di impostare un budget mensile per questa
                categoria.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <ZapIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium">Ottimizza le utenze</h4>
              <p className="text-sm text-muted-foreground">
                Le spese per utenze sono aumentate del 5.8%. Confronta le
                offerte di diversi fornitori per trovare tariffe più
                convenienti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
