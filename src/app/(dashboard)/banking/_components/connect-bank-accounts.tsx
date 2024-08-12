"use client";

import React from "react";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { type findAllInstitutions } from "~/lib/cached-queries";

type Institution = Awaited<ReturnType<typeof findAllInstitutions>>[number];

export function ConnectBankAccounts(props: { institution: Institution }) {
  const { institution } = props;

  return (
    <div className="group flex w-full max-w-sm items-center justify-between space-x-2 hover:opacity-100">
      <div className="row flex gap-2">
        <Image
          src={
            institution.logo ??
            `https://cdn-logos.gocardless.com/ais/SANDBOX.png`
          }
          alt="logo della banca"
          width={40}
          height={40}
          className="rounded-sm border"
        />
        <div className="flex flex-col">
          <span className="max-w-[90%] truncate">{institution.name}</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="text-xs text-slate-500">Tramite GoCardless</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-72" align="start">
              <div className="flex justify-between space-x-4 text-sm text-slate-500">
                With GoCardLess we can connect to more than 2,500 banks in 31
                countries across the UK and Europe.
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <Button
        type="submit"
        variant="outline"
        className="opacity-0 transition-opacity group-hover:opacity-100"
        size="sm"
      >
        Connetti
      </Button>
    </div>
  );
}
