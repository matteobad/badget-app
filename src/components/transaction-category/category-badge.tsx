import type { IconName } from "lucide-react/dynamic";
import { getCategoryColors } from "~/shared/helpers/categories";
import { DynamicIcon } from "lucide-react/dynamic";

import { Badge } from "../ui/badge";

type CategoryBadgeProps = {
  category?: {
    color: string | null;
    icon: string | null;
    name: string;
  };
} & React.ComponentProps<typeof Badge>;

export function CategoryBadge(props: CategoryBadgeProps) {
  const { category, ...rest } = props;
  const icon = (category?.icon ?? "circle-dashed") as IconName;

  const { backgroundColor, borderColor, color } = getCategoryColors(
    category?.color ?? undefined,
  );

  return (
    <Badge
      variant="category"
      style={{ backgroundColor, color, borderColor }}
      {...rest}
    >
      <DynamicIcon name={icon} className="shrink-0" />
      <span className="line-clamp-1 text-ellipsis">
        {category?.name ?? "Uncategorized"}
      </span>
    </Badge>
  );
}

export function CategoryLabel(props: CategoryBadgeProps) {
  const { category } = props;
  const icon = (category?.icon ?? "circle-dashed") as IconName;

  // const { color } = getCategoryColors(category?.color ?? undefined);

  return (
    <div className="flex w-full items-center gap-1.5">
      <DynamicIcon name={icon} />
      <span className="flex-1">{category?.name ?? "Uncategorized"}</span>
      <span
        className="size-3"
        style={{ backgroundColor: category?.color ?? "#737373" }}
      ></span>
    </div>
  );
}
