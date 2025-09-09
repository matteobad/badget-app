import { useTransactionCategoryParams } from "~/hooks/use-transaction-category-params";
import { PlusIcon } from "lucide-react";

import { Button } from "../ui/button";

type CreateCategoryButtonProps = React.ComponentProps<typeof Button>;

export function CreateCategoryButton(props: CreateCategoryButtonProps) {
  const { setParams } = useTransactionCategoryParams();

  return (
    <Button
      {...props}
      onClick={() => void setParams({ createCategory: true })}
      className="rounded-none"
    >
      <PlusIcon className="size-4" />
      Create
    </Button>
  );
}
