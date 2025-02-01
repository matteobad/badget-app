"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, MoreVertical, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  type: string;
  lastFour: string;
}

interface Institution {
  id: string;
  name: string;
  logoUrl: string;
  accounts: BankAccount[];
}

export function BankAccountsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: "1",
      name: "Big National Bank",
      logoUrl: "/placeholder.svg?height=40&width=40",
      accounts: [
        {
          id: "1",
          name: "Checking",
          balance: 5000,
          type: "Checking",
          lastFour: "1234",
        },
        {
          id: "2",
          name: "Savings",
          balance: 10000,
          type: "Savings",
          lastFour: "5678",
        },
      ],
    },
    {
      id: "2",
      name: "Credit Union",
      logoUrl: "/placeholder.svg?height=40&width=40",
      accounts: [
        {
          id: "3",
          name: "Checking",
          balance: 3000,
          type: "Checking",
          lastFour: "2345",
        },
      ],
    },
    {
      id: "3",
      name: "Investment Firm",
      logoUrl: "/placeholder.svg?height=40&width=40",
      accounts: [
        {
          id: "4",
          name: "Investment Account",
          balance: 50000,
          type: "Investment",
          lastFour: "9012",
        },
      ],
    },
  ]);

  const [editingAccount, setEditingAccount] = useState<string | null>(null);

  const handleEdit = (institutionId: string, accountId: string) => {
    setEditingAccount(accountId);
  };

  const handleSave = (
    institutionId: string,
    accountId: string,
    newBalance: number,
  ) => {
    setInstitutions(
      institutions.map((institution) =>
        institution.id === institutionId
          ? {
              ...institution,
              accounts: institution.accounts.map((account) =>
                account.id === accountId
                  ? { ...account, balance: newBalance }
                  : account,
              ),
            }
          : institution,
      ),
    );
    setEditingAccount(null);
  };

  const handleDelete = (institutionId: string, accountId: string) => {
    setInstitutions(
      institutions
        .map((institution) =>
          institution.id === institutionId
            ? {
                ...institution,
                accounts: institution.accounts.filter(
                  (account) => account.id !== accountId,
                ),
              }
            : institution,
        )
        .filter((institution) => institution.accounts.length > 0),
    );
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Bank Accounts</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Connect New Account
        </Button>
      </header>
      <div className="space-y-6">
        {institutions.map((institution) => (
          <Card key={institution.id}>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <Image
                src={institution.logoUrl}
                alt={`${institution.name} logo`}
                className="h-10 w-10"
              />
              <CardTitle>{institution.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {institution.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        **** {account.lastFour}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold">
                        $
                        {editingAccount === account.id ? (
                          <Input
                            type="number"
                            defaultValue={account.balance}
                            className="w-32"
                            onBlur={(e) =>
                              handleSave(
                                institution.id,
                                account.id,
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        ) : (
                          account.balance.toLocaleString()
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleEdit(institution.id, account.id)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDelete(institution.id, account.id)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
