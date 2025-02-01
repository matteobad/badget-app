"use server";

import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Circle, CircleCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export async function NotificationCard() {
  const user = await currentUser();

  // Use default false values if metadata is not yet set
  const bankingCompleted =
    (user?.privateMetadata.bankingCompleted as boolean) || false;
  const savingsCompleted =
    (user?.privateMetadata.savingsCompleted as boolean) || false;
  const pensionCompleted =
    (user?.privateMetadata.pensionCompleted as boolean) || false;

  return bankingCompleted && savingsCompleted && pensionCompleted ? (
    <UpgradeCard />
  ) : (
    <OnboardingCard
      bankingCompleted={bankingCompleted}
      savingsCompleted={savingsCompleted}
      pensionCompleted={pensionCompleted}
    />
  );
}

function OnboardingCard({
  bankingCompleted,
  savingsCompleted,
  pensionCompleted,
}: {
  bankingCompleted: boolean;
  savingsCompleted: boolean;
  pensionCompleted: boolean;
}) {
  return (
    <Card>
      <CardHeader className="p-2 pt-0 md:p-4">
        <CardTitle className="text-base">Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-sm text-muted-foreground md:p-4 md:pt-0">
        <ul className="mb-3">
          <li className="flex items-center gap-1">
            {bankingCompleted ? (
              <CircleCheck className="size-4" />
            ) : (
              <Circle className="size-4" />
            )}
            <Link
              href={"/onboarding?step=banking"}
              className="flex h-7 w-full items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2"
            >
              <div className="line-clamp-1 grow overflow-hidden pr-6 font-medium text-muted-foreground">
                Banking
              </div>
            </Link>
          </li>
          <li className="flex items-center">
            {savingsCompleted ? (
              <CircleCheck className="mr-1 inline size-4" />
            ) : (
              <Circle className="mr-1 inline size-4" />
            )}
            <Link
              href={"/onboarding?step=savings"}
              className="flex h-7 w-full items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2"
            >
              <div className="line-clamp-1 grow overflow-hidden pr-6 font-medium text-muted-foreground">
                Risparmi
              </div>
            </Link>
          </li>
          <li className="flex items-center">
            {pensionCompleted ? (
              <CircleCheck className="mr-1 inline size-4" />
            ) : (
              <Circle className="mr-1 inline size-4" />
            )}
            <Link
              href={"/onboarding?step=pension"}
              className="flex h-7 w-full items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2"
            >
              <div className="line-clamp-1 grow overflow-hidden pr-6 font-medium text-muted-foreground">
                Pensione
              </div>
            </Link>
          </li>
        </ul>
        <Progress
          value={
            (((bankingCompleted ? 1 : 0) +
              (savingsCompleted ? 1 : 0) +
              (pensionCompleted ? 1 : 0)) /
              3) *
            100
          }
        />
      </CardContent>
    </Card>
  );
}

function UpgradeCard() {
  return (
    <Card>
      <CardHeader className="p-2 pt-0 md:p-4">
        <CardTitle className="text-base">Upgrade to Pro</CardTitle>
        <CardDescription className="text-xs">
          Sblocca tutte le funzionalità e ottieni accesso illimitato al nostro
          team di supporto.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
        <Button size="sm" className="w-full">
          Upgrade
        </Button>
      </CardContent>
    </Card>
  );
}
