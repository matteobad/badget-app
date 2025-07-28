import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import { CreateCategoryButton } from "../create-category-button";

export function CategoryListEmpty() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createDefaultCategoriesMutation = useMutation(
    trpc.category.createDefaults.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.category.get.queryKey(),
        });

        toast.success("Default categories created");
      },
    }),
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <span className="text-sm text-muted-foreground">No categories found</span>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            createDefaultCategoriesMutation.mutate();
          }}
        >
          Use defauls (reccomeneded)
        </Button>
        <CreateCategoryButton variant="outline" />
      </div>
    </div>
  );
}
