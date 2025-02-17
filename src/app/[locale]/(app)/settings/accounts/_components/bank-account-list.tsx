"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DollarSign } from "lucide-react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type QUERIES } from "~/server/db/queries";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BankAccountList({
  connections,
}: {
  connections: Awaited<
    ReturnType<typeof QUERIES.getAccountsWithConnectionsForUser>
  >;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Your Bank Accounts</CardTitle>
        <CardDescription>
          Choose the accounts you want to manage in your finance application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {connections.map((account) => (
            <div
              key={account.id}
              className={cn(
                "flex items-center space-x-4 rounded-md border border-primary p-4",
              )}
            >
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {getInitials(account.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <Link
                  href={`/banking/${account.id}`}
                  className="block text-sm leading-none font-medium hover:underline"
                >
                  {account.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {account.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  {formatDistanceToNow(account.updatedAt!, {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      parseFloat(account.balance) < 0 && "text-destructive",
                    )}
                  >
                    {parseFloat(account.balance).toLocaleString("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
