import { Suspense } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { useConnectParams } from "~/hooks/use-connect-params";
import { InstitutionListServer } from "./institution-list.server";

export function SelectConnectionForm() {
  const { q, setParams } = useConnectParams();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-1">
        <h2 className="text-xl font-semibold">Collega un account</h2>
        <p className="text-sm text-slate-500">
          Seleziona l&apos;istituto finanziario che vuoi collegare oppure puoi
          aggiungere un conto{" "}
          <Button
            className="h-auto p-0"
            variant="link"
            onClick={() => {
              void setParams({ step: "create-account" });
            }}
          >
            manualmente
          </Button>
        </p>
      </header>
      <div>
        <Input
          placeholder="Search bank..."
          type="search"
          // onChange={(evt) => {
          //   if (evt.target.value !== q) {
          //     void setParams({ q: evt.target.value || null });
          //   }
          // }}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          autoFocus
          value={q}
        />
        <Suspense fallback={<Skeleton />} key={q}>
          <InstitutionListServer q={q} />
        </Suspense>
      </div>
    </section>
  );
}
