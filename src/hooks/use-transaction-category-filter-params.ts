import { transactionCategoryFilterParamsSchema } from "~/shared/validators/transaction-category.schema";
import { useQueryStates } from "nuqs";

export function useTransactionCategoryFilterParams() {
  const [filters, setFilters] = useQueryStates(
    transactionCategoryFilterParamsSchema,
  );

  const clearAllFilters = () => {
    void setFilters({
      q: null,
    });
  };

  return {
    filters,
    setFilters,
    hasFilters: Object.values(filters).some((value) => value !== null),
    clearAllFilters,
  };
}
