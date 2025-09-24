import type { Metadata } from "next";
import type { SearchParams } from "nuqs";
import { cookies } from "next/headers";
import { TrackerCalendar } from "~/components/tracker/calendar/tracker-calendar";
import { Cookies } from "~/shared/constants/cookies";

export const metadata: Metadata = {
  title: "Tracker | Badget",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(_props: Props) {
  // const searchParams = await props.searchParams;
  // const filter = loadTrackerFilterParams(searchParams);
  // const { sort } = loadSortParams(searchParams);
  const weeklyCalendar = (await cookies()).get(Cookies.WeeklyCalendar);

  //   prefetch(
  //     trpc.trackerProjects.get.infiniteQueryOptions({
  //       ...filter,
  //       sort,
  //     }),
  //   );

  return (
    <div className="px-6">
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
