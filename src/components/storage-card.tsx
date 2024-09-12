"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function UpgradeCard() {
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
