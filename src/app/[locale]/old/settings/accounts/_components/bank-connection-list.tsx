"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Edit, Link, MoreVertical, RefreshCw } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { euroFormat } from "~/lib/utils";
import { type getUserBankConnections } from "~/server/db/queries/cached-queries";

export function BankConnectionList({
  connections,
}: {
  connections: Awaited<ReturnType<typeof getUserBankConnections>>;
}) {
  const [editingConnection, setEditingConnection] = useState<number | null>(
    null,
  );

  const handleEdit = (connectionId: number) => {
    setEditingConnection(connectionId);
  };

  const handleCloseSheet = () => {
    setEditingConnection(null);
  };

  const handleReconnect = (connectionId: number) => {
    console.log(`Reconnecting institution ${connectionId}`);
    // Implement reconnection logic here
  };

  const handleManualUpdate = (connectionId: number) => {
    console.log(`Manually updating institution ${connectionId}`);
    // Implement manual update logic here
  };

  const handleUpdateAccountName = (
    connectionId: number,
    accountId: number,
    newName: string,
  ) => {
    console.log(
      `Updating account ${accountId} for institution ${connectionId} with new name ${newName}`,
    );
  };

  const handleToggleAccount = (connectionId: number, accountId: number) => {
    console.log(
      `Toggling account ${accountId} for institution ${connectionId}`,
    );
  };

  return (
    <>
      <div className="space-y-6">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={connection.logoUrl ?? ""} />
                  <AvatarFallback>
                    {connection.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <CardTitle>{connection.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!mt-0 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(connection.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleManualUpdate(connection.id)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Manual Update
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connection.bankAccount.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-sm text-muted-foreground">****</div>
                    </div>
                    <div className="mr-4 text-xl font-bold">
                      {euroFormat(account.balance ?? "0")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Sheet open={editingConnection !== null} onOpenChange={handleCloseSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Connection</SheetTitle>
            <SheetDescription>
              Update your connection details and manage accounts.
            </SheetDescription>
          </SheetHeader>
          {editingConnection && (
            <div className="space-y-4 py-6">
              <header className="flex items-center space-x-4">
                <Avatar className="size-8">
                  <AvatarImage
                    src={
                      connections.find((i) => i.id === editingConnection)
                        ?.logoUrl ?? ""
                    }
                  />
                  <AvatarFallback>
                    {connections
                      .find((i) => i.id === editingConnection)
                      ?.name.slice(0, 2)
                      .toUpperCase() ?? ""}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">
                  {connections.find((i) => i.id === editingConnection)?.name}
                </h3>
              </header>
              <div className="text-sm text-slate-900">
                <p>Total Transaction Days: {90}</p>
                <p>
                  Expiration Date:{" "}
                  {format(
                    connections.find((i) => i.id === editingConnection)
                      ?.expiresAt ?? new Date(),
                    "yyyy LL dd",
                  )}
                </p>
              </div>
              <div className="space-x-2">
                <Button onClick={() => handleReconnect(editingConnection)}>
                  <Link className="mr-2 h-4 w-4" /> Reconnect
                </Button>
                <Button onClick={() => handleManualUpdate(editingConnection)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Manual Update
                </Button>
              </div>
              <div className="space-y-4 py-4">
                <h4 className="text-md font-semibold">Accounts</h4>
                {connections
                  .find((i) => i.id === editingConnection)
                  ?.bankAccount.map((account) => (
                    <div key={account.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Account Name</Label>
                        <Switch
                          id={`account-enabled-${account.id}`}
                          checked={!!account.enabled}
                          onCheckedChange={() =>
                            handleToggleAccount(editingConnection, account.id)
                          }
                        />
                      </div>
                      <Input
                        id={`account-name-${account.id}`}
                        value={account.name}
                        onChange={(e) =>
                          handleUpdateAccountName(
                            editingConnection,
                            account.id,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
