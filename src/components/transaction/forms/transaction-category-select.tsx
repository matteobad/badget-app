import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryTree } from "~/components/category/trees/category-tree";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { buildCategoryRecord } from "~/shared/helpers/categories";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

type Category = RouterOutput["transactionCategory"]["get"][number];

type Props = {
  selectedItems?: string[];
  onSelect?: (category?: Category) => void;
};

export function TransactionCategorySelect({ selectedItems, onSelect }: Props) {
  const [search, setSearch] = useState<string | null>(null);

  const tScoped = useScopedI18n("category.type");

  const trpc = useTRPC();

  const { data } = useQuery(trpc.transactionCategory.get.queryOptions());

  const items = useMemo(() => {
    const incomeCategories =
      data?.filter((item) => item.type === "income") ?? [];
    const expenseCategories =
      data?.filter((item) => item.type === "expense") ?? [];
    const transferCategories =
      data?.filter((item) => item.type === "transfer") ?? [];

    return {
      income: buildCategoryRecord(incomeCategories),
      expense: buildCategoryRecord(expenseCategories),
      transfer: buildCategoryRecord(transferCategories),
    };
  }, [data]);

  return (
    <div className="-m-1 flex w-[250px] flex-col">
      <Input
        placeholder="Search category..."
        defaultValue={search ?? undefined}
        onChange={(event) => setSearch(event.target.value)}
        className="border-none shadow-none"
      />
      <Separator />
      <ScrollArea className="h-[300px] max-h-fit p-1" hideScrollbar>
        {Object.values(CATEGORY_TYPE).map((categoryType) => {
          return (
            <div key={categoryType}>
              <label className="sticky top-0 z-20 block w-full bg-background p-2 text-xs text-muted-foreground capitalize">
                {tScoped(categoryType)}
              </label>
              <div>
                <CategoryTree
                  items={items[categoryType]}
                  selectedItems={selectedItems}
                  searchValue={search}
                  onSelect={(categoryId: string) => {
                    const category = data?.find(({ id }) => id === categoryId);
                    onSelect?.(category);
                  }}
                />
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
