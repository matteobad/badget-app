import { useCategoryParams } from "~/hooks/use-category-params";
import { PlusIcon } from "lucide-react";

import { Button } from "../ui/button";

type CreateCategoryButtonProps = React.ComponentProps<typeof Button>;

export function CreateCategoryButton(props: CreateCategoryButtonProps) {
  const { setParams } = useCategoryParams();

  return (
    <Button {...props} onClick={() => void setParams({ createCategory: true })}>
      <PlusIcon className="size-4" />
      New category
    </Button>
  );
}
