import { type z } from "zod";

import { type dashboardSearchParamsSchema } from "~/lib/validators";
import { getFilteredExpenses } from "~/server/db/queries/cached-queries";
import ExensesChart from "./expenses-chart";

export async function ExpensesChartServer(
  params: z.infer<typeof dashboardSearchParamsSchema>,
) {
  const expenses = await getFilteredExpenses(params);

  return <ExensesChart expenses={expenses} />;
}
