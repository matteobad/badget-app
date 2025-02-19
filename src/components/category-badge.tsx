import type { dynamicIconImports } from "lucide-react/dynamic";
import { type VariantProps } from "class-variance-authority";
import { DynamicIcon } from "lucide-react/dynamic";

import { cn } from "~/lib/utils";
import { Badge, badgeVariants } from "./ui/badge";

export function CategoryBadge({
  className,
  color = "240 3.8% 46.1%",
  name = "Uncategorized",
  icon = "circle-dashed",
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    color?: string;
    name?: string;
    icon?: keyof typeof dynamicIconImports;
  }) {
  return (
    <Badge
      className={cn(badgeVariants({ variant: "outline" }), className)}
      variant="outline"
      style={{
        border: `1px solid hsl(${color})`,
        color: `hsl(${color})`,
      }}
      {...props}
    >
      <DynamicIcon name={icon} />
      {name}
    </Badge>
  );
}
