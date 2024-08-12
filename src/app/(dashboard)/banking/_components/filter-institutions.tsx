"use client";

import React from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function SelectBankAccount() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="text" placeholder="Revolut" />
      <Button type="submit">Crea</Button>
    </div>
  );
}
