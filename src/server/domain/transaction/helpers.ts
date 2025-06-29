import { cookies } from "next/headers";
import { Cookies } from "~/shared/constants/cookies";

export async function getInitialTransactionsColumnVisibility() {
  const cookieStore = await cookies();

  const columnsToHide = ["tags", "method", "counterparty"];

  const savedColumns = cookieStore.get(Cookies.TransactionsColumns)?.value;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
