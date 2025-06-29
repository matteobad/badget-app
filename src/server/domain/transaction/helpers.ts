import { cookies } from "next/headers";
import { Cookies } from "~/shared/constants/cookies";

export async function getInitialTransactionsColumnVisibility() {
  const cookieStore = await cookies();

  const columnsToHide = ["tags", "method", "counterparty"];

  const savedColumns = cookieStore.get(Cookies.TransactionsColumns)?.value;

  return savedColumns
    ? JSON.parse(savedColumns)
    : columnsToHide.reduce(
        (acc, col) => {
          acc[col] = false;
          return acc;
        },
        {} as Record<string, boolean>,
      );
}
