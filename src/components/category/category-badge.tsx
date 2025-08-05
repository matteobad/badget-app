import type { IconName } from "lucide-react/dynamic";
import { getCategoryColors } from "~/shared/helpers/categories";
import { DynamicIcon } from "lucide-react/dynamic";

import { Badge } from "../ui/badge";

type CategoryBadgeProps = {
  category: {
    color: string | null;
    icon: string | null;
    name: string;
  };
};

export function CategoryBadge(props: CategoryBadgeProps) {
  const { category } = props;
  const icon = (category.icon ?? "circle-dashed") as IconName;

  const { backgroundColor, borderColor, color } = getCategoryColors(
    category.color ?? undefined,
  );

  return (
    <Badge variant="category" style={{ backgroundColor, color, borderColor }}>
      <DynamicIcon name={icon} />
      <span>{category.name}</span>
    </Badge>
  );
}
