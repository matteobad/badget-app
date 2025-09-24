import type { Metadata } from "next";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { TrackerCalendar } from "~/components/tracker/calendar/tracker-calendar";
import { DataTable } from "~/components/tracker/data-table";
import { Loading } from "~/components/tracker/data-table/loading";
import { loadSortParams } from "~/hooks/use-sort-params";
import { loadTrackerFilterParams } from "~/hooks/use-tracker-filter-params";
import { Cookies } from "~/shared/constants/cookies";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Tracker | Midday",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const filter = loadTrackerFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);
  const weeklyCalendar = (await cookies()).get(Cookies.WeeklyCalendar);

  //   prefetch(
  //     trpc.trackerProjects.get.infiniteQueryOptions({
  //       ...filter,
  //       sort,
  //     }),
  //   );

  return (
    <div>
      <TrackerCalendar weeklyCalendar={weeklyCalendar?.value === "true"} />

      {/* <div className="mt-14 mb-6 flex items-center justify-between space-x-4">
        <h2 className="text-md font-medium">Projects</h2>

        <div className="flex space-x-2">
          <TrackerSearchFilter />
          <OpenTrackerSheet />
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <DataTable />
      </Suspense> */}
    </div>
  );
}
