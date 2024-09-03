import { Suspense } from "react";

import { ChangeStepButton } from "../change-step-button";
import { InstitutionListLoading } from "./institution-list.loading";
import { InstitutionListServer } from "./institution-list.server";
import { Search } from "./search";

export function ConnectStep({ query }: { query: string }) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-1">
        <h2 className="text-xl font-semibold">Collega un account</h2>
        <p className="text-sm text-slate-500">
          Seleziona l&apos;istituto finanziario che vuoi collegare oppure puoi
          aggiungere un conto{" "}
          <ChangeStepButton step="manual" label="manualmente" />
        </p>
      </header>
      <div className="flex h-[320px] flex-col gap-6">
        <Search placeholder="search..." />
        <Suspense key={query} fallback={<InstitutionListLoading />}>
          <InstitutionListServer query={query} />
        </Suspense>
      </div>
    </section>
  );
}
