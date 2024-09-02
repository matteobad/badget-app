"use server";

import { getFilteredInstitutions } from "~/server/db/queries/cached-queries";

export async function InstitutionListServer({ q }: { q: string }) {
  const institutions = await getFilteredInstitutions({ q });

  return (
    <ul className="max-h-[200px]">
      {institutions.map((institution) => {
        return <li key={institution.id}>{institution.name}</li>;
      })}
    </ul>
  );
}
