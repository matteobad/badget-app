import { Suspense } from "react";

import { Loading } from "./base-facets.loading";

export function BaseFacets() {
  return (
    <div className="flex items-center justify-end gap-4">
      <Suspense fallback={<Loading />}></Suspense>
    </div>
  );
}
