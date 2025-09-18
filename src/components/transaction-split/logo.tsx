"use client";

import { useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Logo() {
  const { watch } = useFormContext<SplitFormValues>();
  const logoUrl = watch("transaction.logoUrl");

  return (
    <div className="group relative h-[80px]">
      <Avatar className="h-full w-auto max-w-none rounded-none object-contain">
        <AvatarImage
          className="rounded-none"
          src={logoUrl ?? undefined}
          alt={`transaction logo`}
        ></AvatarImage>
        <AvatarFallback className="rounded-none bg-transparent">
          <div className="h-[80px] w-[80px] bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
